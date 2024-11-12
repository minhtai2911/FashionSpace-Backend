import { Router } from "express";
import productVariantController from "../controllers/productVariantController.js";

const router = Router();

router.get("/", productVariantController.getProductVariants);
router.get("/:id", productVariantController.getProductVariantById); 
router.post("/", productVariantController.createProductVariant);
router.put("/:id", productVariantController.updateProductVariantById);
router.delete("/:id", productVariantController.deleteProductVariantById);
router.get("/productId/:id", productVariantController.getProductVariantsByProductId);
router.delete("/productId/:id", productVariantController.deleteProductVariantsByProductId);

export default router;