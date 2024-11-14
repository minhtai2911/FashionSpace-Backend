import { Router } from "express";
import productVariantController from "../controllers/productVariantController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", productVariantController.getProductVariants);
router.get("/:id", productVariantController.getProductVariantById); 
router.post("/", authMiddleware.verifyToken, productVariantController.createProductVariant);
router.put("/:id", authMiddleware.verifyToken, productVariantController.updateProductVariantById);
router.delete("/:id", authMiddleware.verifyToken, productVariantController.deleteProductVariantById);
router.get("/productId/:id", productVariantController.getProductVariantsByProductId);
router.delete("/productId/:id", authMiddleware.verifyToken, productVariantController.deleteProductVariantsByProductId);

export default router;