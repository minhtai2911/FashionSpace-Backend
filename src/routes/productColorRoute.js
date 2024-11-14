import { Router } from "express";
import productColorController from "../controllers/productColorController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", productColorController.getAllProductColors);
router.get("/:id", productColorController.getProductColorById);
router.post("/", authMiddleware.verifyToken, productColorController.createProductColor);
router.put("/:id", authMiddleware.verifyToken, productColorController.updateProductColorById);
router.delete("/:id", authMiddleware.verifyToken, productColorController.deleteProductColorById);

export default router;