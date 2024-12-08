import { Router } from "express";
import productColorController from "../controllers/productColorController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", productColorController.getAllProductColors);
router.get("/:id", productColorController.getProductColorById);
router.post("/", authMiddleware.verifyToken, authMiddleware.checkPermission(["Admin"]), productColorController.createProductColor);
router.put("/:id", authMiddleware.verifyToken, authMiddleware.checkPermission(["Admin"]), productColorController.updateProductColorById);
router.delete("/:id", authMiddleware.verifyToken, authMiddleware.checkPermission(["Admin"]), productColorController.deleteProductColorById);

export default router;