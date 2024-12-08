import { Router } from "express";
import productSizeController from "../controllers/productSizeController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", productSizeController.getAllProductSizes);
router.get("/:id", productSizeController.getProductSizeById);
router.post("/", authMiddleware.verifyToken, authMiddleware.checkPermission(["Admin"]), productSizeController.createProductSize);
router.put("/:id", authMiddleware.verifyToken, authMiddleware.checkPermission(["Admin"]), productSizeController.updateProductSizeById);
router.delete("/:id", authMiddleware.verifyToken, authMiddleware.checkPermission(["Admin"]), productSizeController.deleteProductSizeById);
router.get("/categoryId/:id", productSizeController.getProductSizesByCategoryId);

export default router;