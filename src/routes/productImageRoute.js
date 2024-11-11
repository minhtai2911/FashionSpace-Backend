import { Router } from "express";
import productImageController from "../controllers/productImageController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = Router();

router.get(
  "/",
  authMiddleware.verifyToken,
  productImageController.getAllProductImagesByProductId
);
router.get(
  "/:id",
  authMiddleware.verifyToken,
  productImageController.getProductImageById
);
router.post(
  "/",
  authMiddleware.verifyToken,
  upload.uploadProduct.array("imagePath"),
  productImageController.createProductImage
);
router.put(
  "/:id",
  authMiddleware.verifyToken,
  upload.uploadProduct.single("imagePath"),
  productImageController.updateProductImageById
);
router.delete(
  "/",
  authMiddleware.verifyToken,
  productImageController.deleteProductImageByProductId
);

export default router;
