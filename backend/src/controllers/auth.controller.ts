import { NextFunction, Request, Response } from "express";

export async function register(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { username, email, password } = req.body;
    } catch (error) {}
}
