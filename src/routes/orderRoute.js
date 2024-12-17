import { Router } from "express";
import orderController from "../controllers/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkPermission(["Admin", "Employee"]),
  orderController.getAllOrders
);
router.get("/:id", authMiddleware.verifyToken, orderController.getOrderById);
router.post("/", authMiddleware.verifyToken, orderController.createOrder);
router.get(
  "/get/userId",
  authMiddleware.verifyToken,
  orderController.getOrderByUserId
);

export default router;
