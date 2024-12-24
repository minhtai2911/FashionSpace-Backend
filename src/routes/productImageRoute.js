import { Router } from "express";
import productImageController from "../controllers/productImageController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = Router();

router.get("/productId/:id", productImageController.getAllProductImagesByProductId);
router.get("/:id", productImageController.getProductImageById);
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkPermission(["Admin"]),
  upload.uploadProduct.array("imagePath"),
  productImageController.createProductImage
);
router.put(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkPermission(["Admin"]),
  upload.uploadProduct.single("imagePath"),
  productImageController.updateProductImageById
);
router.delete(
  "/productId/:productId",
  authMiddleware.verifyToken,
  authMiddleware.checkPermission(["Admin"]),
  productImageController.deleteProductImageByProductId
);

router.delete(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkPermission(["Admin"]),
  productImageController.deleteProductImageById
);

export default router;
