import express from "express";

import errorHandler from "./middleware/errorhandler";
import authRoutes from "./routes/auth.routes";

const app = express();

app.get("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Server Running");
});

app.use(errorHandler);

export { app };
