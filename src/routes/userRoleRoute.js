import { Router } from "express";
import userRoleController from "../controllers/userRoleController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware.verifyToken, userRoleController.getAllUserRoles);
router.get("/:id", authMiddleware.verifyToken, userRoleController.getUserRoleById);
router.post("/", authMiddleware.verifyToken, userRoleController.createUserRole);
router.put("/:id", authMiddleware.verifyToken, userRoleController.updateUserRole);
router.delete("/:id", authMiddleware.verifyToken, userRoleController.deleteUserRole);

export default router;