import { Router } from "express";
import orderController from "../controllers/orderController.js";

const router = Router();

router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.delete("/:id", orderController.deleteOrderById);
router.put("/:id", orderController.updateOrderById);
router.post("/", orderController.createOrder);

export default router;