import { Router } from "express";
import * as meController from "../controllers/me.controller.js";

const meRouter = Router();

meRouter.get("/", meController.getMe);

export default meRouter;