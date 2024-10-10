import { Router } from "express";
import productImageController from "../controllers/productImageController.js";

const router = Router();

router.get("/", productImageController.getAllProductImagesByProductId);
router.get("/:id", productImageController.getProductImageById);
router.post("/", productImageController.createProductImage);
router.put("/:id", productImageController.updateProductImageById);
router.delete("/:id", productImageController.deleteProductImageById);

export default router;