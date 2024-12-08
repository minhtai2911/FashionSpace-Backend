import { Router } from "express";
import orderTrackingController from "../controllers/orderTrackingController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get(
  "/:orderId",
  authMiddleware.verifyToken,
  orderTrackingController.getOrderTrackingByOrderId
);
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkPermission(["Employee"]),
  orderTrackingController.createOrderTracking
);

export default router;
