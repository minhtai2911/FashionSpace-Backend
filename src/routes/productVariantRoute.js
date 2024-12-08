import { Router } from "express";
import productVariantController from "../controllers/productVariantController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", productVariantController.getProductVariants);
router.get("/:id", productVariantController.getProductVariantById); 
router.post("/", authMiddleware.verifyToken, authMiddleware.checkPermission(["Admin"]), productVariantController.createProductVariant);
router.put("/:id", authMiddleware.verifyToken, authMiddleware.checkPermission(["Admin"]), productVariantController.updateProductVariantById);
router.delete("/:id", authMiddleware.verifyToken, authMiddleware.checkPermission(["Admin"]), productVariantController.deleteProductVariantById);
router.get("/productId/:id", productVariantController.getProductVariantsByProductId);
router.delete("/productId/:id", authMiddleware.verifyToken, authMiddleware.checkPermission(["Admin"]), productVariantController.deleteProductVariantsByProductId);
router.get("/:productId/:colorId/:sizeId", productVariantController.getProductVariantByProductIdColorIdSizeId);

export default router;