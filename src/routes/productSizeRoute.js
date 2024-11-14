import { Router } from "express";
import productSizeController from "../controllers/productSizeController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", productSizeController.getAllProductSizes);
router.get("/:id", productSizeController.getProductSizeById);
router.post("/", authMiddleware.verifyToken, productSizeController.createProductSize);
router.put("/:id", authMiddleware.verifyToken, productSizeController.updateProductSizeById);
router.delete("/:id", authMiddleware.verifyToken, productSizeController.deleteProductSizeById);

export default router;