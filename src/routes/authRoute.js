import { Router } from "express";
import authController from "../controllers/authController.js";

const router = Router();

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/logout", authController.logout);
router.post("/refreshToken", authController.refreshToken);

export default router;
