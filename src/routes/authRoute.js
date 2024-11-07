import { Router } from "express";
import authController from "../controllers/authController.js";
import passport from "../middleware/passport.js";
import dotenv from "dotenv";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();
dotenv.config();

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/logout", authMiddleware.verifyToken, authController.logout);
router.post("/refreshToken", authController.refreshToken);
router.post("/generateOTP", authController.generateOTP);
router.post("/sendOTP", authController.sendOTP);
router.post("/checkOTPByEmail", authController.checkOTPByEmail);
router.post("/checkEmail", authController.checkEmail);
router.post("/forgotPassword", authMiddleware.verifyToken, authController.forgotPassword);
router.post("/resetPassword", authMiddleware.verifyToken, authController.resetPassword);
router.get("/verifyAccount/:id", authController.verifyAccount);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.URL_CLIENT}/login`,
  }),
  (req, res) => {
    const accessToken = req.user.accessToken;
    return res.status(200).json({ ...req.user._doc, accessToken });
  }
);

export default router;
