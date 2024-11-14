import { Router } from "express";
import categoryController from "../controllers/categoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", authMiddleware.verifyToken, categoryController.createCategory);
router.put("/:id", authMiddleware.verifyToken, categoryController.updateCategoryById);
router.delete("/:id", authMiddleware.verifyToken, categoryController.deleteCategoryById);

export default router;