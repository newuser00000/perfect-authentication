import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import crypto from "node:crypto";
import config from "../config/config";

export async function register(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { username, email, password } = req.body;

        const ipAddress = req.ip;
        const userAgent = req.get("User-Agent");

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });

        if (existingUser) {
            if (existingUser.username === username) {
                return res
                    .status(409)
                    .json({ error: "Username already exists" });
            }
            if (existingUser.email === email) {
                return res.status(409).json({ error: "Email already exists" });
            }
        }

        const hashedPassword = await argon2.hash(password);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                },
            });

            const refreshToken = jwt.sign(
                {
                    userId: user.id,
                },
                config.JWT_REFRESH_SECRET!,
                {
                    expiresIn: "7d",
                },
            );

            const refreshTokenHash = crypto
                .createHash("sha256")
                .update(refreshToken)
                .digest("hex");

            const session = await tx.session.create({
                data: {
                    userId: user.id,
                    ip: ipAddress,
                    userAgent,
                    refreshTokenHash,
                },
            });

            const accessToken = jwt.sign(
                {
                    userId: user.id,
                    sessionId: session.id,
                },
                config.JWT_ACCESS_SECRET!,
                {
                    expiresIn: "15m",
                },
            );

            return { user, refreshToken, accessToken };
        });

        const { user, refreshToken, accessToken } = result;

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            accessToken,
        });
    } catch (error) {
        next(error);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isPasswordValid = await argon2.verify(user.password, password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const ipAddress = req.ip;
        const userAgent = req.get("User-Agent");

        const refreshToken = jwt.sign(
            {
                userId: user.id,
            },
            config.JWT_REFRESH_SECRET!,
            {
                expiresIn: "7d",
            },
        );

        const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const session = await prisma.session.create({
            data: {
                userId: user.id,
                ip: ipAddress,
                userAgent,
                refreshTokenHash,
            },
        });

        const accessToken = jwt.sign(
            {
                userId: user.id,
                sessionId: session.id,
            },
            config.JWT_ACCESS_SECRET!,
            {
                expiresIn: "15m",
            },
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            accessToken,
        });
    } catch (error) {
        next(error);
    }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({ error: "No refresh token provided" });
        }

        const decoded = jwt.verify(
            refreshToken,
            config.JWT_REFRESH_SECRET!,
        ) as { userId: string };

        const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const session = await prisma.session.findUnique({
            where: {
                refreshTokenHash,
                isRevoked: false,
            },
        });

        if (!session || decoded.userId !== session.userId) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const newRefreshToken = jwt.sign(
            {
                userId: decoded.userId,
            },
            config.JWT_REFRESH_SECRET!,
            {
                expiresIn: "7d",
            },
        );

        const newRefreshTokenHash = crypto
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex");

        const accessToken = jwt.sign(
            {
                userId: decoded.userId,
                sessionId: session.id,
            },
            config.JWT_ACCESS_SECRET!,
            {
                expiresIn: "15m",
            },
        );

        await prisma.session.update({
            where: {
                id: session.id,
            },
            data: {
                refreshTokenHash: newRefreshTokenHash,
                lastActiveAt: new Date(),
            },
        });

        res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken,
        });
    } catch (error) {
        next(error);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, sessionId } = req.user!;

        const session = await prisma.session.findUnique({
            where: {
                id: sessionId,
            },
        });

        if (!session) {
            return res.status(401).json({ error: "Invalid session" });
        }

        await prisma.session.update({
            where: {
                id: sessionId,
            },
            data: {
                isRevoked: true,
            },
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        next(error);
    }
}

export async function logoutAll(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        await prisma.session.updateMany({
            where: {
                userId,
                isRevoked: false,
            },
            data: {
                isRevoked: true,
            },
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.status(200).json({
            message: "User logged out from all sessions successfully",
        });
    } catch (error) {
        next(error);
    }
}
