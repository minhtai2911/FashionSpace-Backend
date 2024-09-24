import { Router } from "express";
import userRoleController from "../controllers/userRoleController.js";

const router = Router();

router.get("/", userRoleController.getAllUserRoles);
router.get("/:id", userRoleController.getUserRoleById);
router.post("/", userRoleController.createUserRole);
router.put("/:id", userRoleController.updateUserRole);
router.delete("/:id", userRoleController.deleteUserRole);

export default router;