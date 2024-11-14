import { Router } from "express";
import orderController from "../controllers/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware.verifyToken, orderController.getAllOrder);
router.get("/:id", authMiddleware.verifyToken, orderController.getOrderById);
router.delete("/:id", authMiddleware.verifyToken, orderController.deleteOrderById);
router.put("/:id", authMiddleware.verifyToken, orderController.updateOrderById);
router.post("/", authMiddleware.verifyToken, orderController.createOrder);

export default router;