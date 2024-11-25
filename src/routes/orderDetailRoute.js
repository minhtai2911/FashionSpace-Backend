import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import orderDetailController from "../controllers/orderDetailController.js";

const router = Router();

router.get(
  "/orderId/:orderId",
  authMiddleware.verifyToken,
  orderDetailController.getOrderDetailsByOrderId
);
router.get(
  "/:id",
  authMiddleware.verifyToken,
  orderDetailController.getOrderDetailById
);
router.post(
  "/",
  authMiddleware.verifyToken,
  orderDetailController.createOrderDetail
);

export default router;
