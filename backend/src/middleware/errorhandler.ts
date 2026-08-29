import { ErrorRequestHandler } from "express";
import { Prisma } from "../../generated/prisma/client";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err);

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            return res.status(409).json({
                error: "Unique constraint failed",
            });
        }
    }

    return res.status(500).json({
        error: "Internal Server Error",
    });
};

export default errorHandler;
    