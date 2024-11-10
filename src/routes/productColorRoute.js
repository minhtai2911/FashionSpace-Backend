import { Router } from "express";
import productColorController from "../controllers/productColorController.js";

const router = Router();

router.get("/", productColorController.getAllProductColors);
router.get("/:id", productColorController.getProductColorById);
router.post("/", productColorController.createProductColor);
router.put("/:id", productColorController.updateProductColorById);
router.delete("/:id", productColorController.deleteProductColorById);

export default router;