import { Router } from "express";
import productSizeController from "../controllers/productSizeController.js";

const router = Router();

router.get("/", productSizeController.getAllProductSizes);
router.get("/:id", productSizeController.getProductSizeById);
router.post("/", productSizeController.createProductSize);
router.put("/:id", productSizeController.updateProductSizeById);
router.delete("/:id", productSizeController.deleteProductSizeById);

export default router;