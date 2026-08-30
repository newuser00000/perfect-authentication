import express from "express";

import errorHandler from "./middleware/errorhandler";
import authRoutes from "./routes/auth.routes";
import { authenticate } from "./middleware/authenticate";
import meRoutes from "./routes/me.routes";

const app = express();

app.get("/api/auth", authRoutes);

app.use("/me", authenticate, meRoutes);

app.use(errorHandler);

export default app;
