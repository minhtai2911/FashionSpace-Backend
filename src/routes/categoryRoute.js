import { Router } from "express";
import categoryController from "../controllers/categoryController.js";

const router = Router();

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategoryById);
router.delete("/:id", categoryController.deleteCategoryById);

export default router;