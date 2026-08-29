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
