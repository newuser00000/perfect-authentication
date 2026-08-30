import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";
import { prisma } from "../lib/prisma";

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res
                .status(401)
                .json({ error: "No valid authorization header provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET!) as {
            userId: string;
            sessionId: string;
        };

        const session = await prisma.session.findUnique({
            where: {
                id: decoded.sessionId,
                userId: decoded.userId,
                isRevoked: false,
            },
        });

        if (!session) {
            return res.status(401).json({ error: "Invalid session" });
        }

        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
}
