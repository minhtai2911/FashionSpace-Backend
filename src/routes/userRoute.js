import { Router } from "express";
import userController from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = Router();

router.get("/", authMiddleware.verifyToken, authMiddleware.checkPermission(["Admin"]), userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkPermission(["Admin"]),
  userController.updateStatusUserById
);
router.put(
  "/:id",
  authMiddleware.verifyToken,
  upload.uploadAvatar.single("avatarPath"),
  userController.updateUserById
);
router.post("/", authMiddleware.verifyToken, authMiddleware.checkPermission(["Admin"]), userController.createUser);

export default router;
