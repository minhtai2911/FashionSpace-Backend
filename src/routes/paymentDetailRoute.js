import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import paymentDetailController from "../controllers/paymentDetailController.js";

const router = Router();

router.get("/", paymentDetailController.getAllPaymentDetails);
router.get("/:id", paymentDetailController.getPaymentDetailById);
router.delete("/:id", authMiddleware.verifyToken, paymentDetailController.deletePaymentDetailById);
router.put("/:id", authMiddleware.verifyToken, paymentDetailController.updatePaymentDetailById);
router.post("/", authMiddleware.verifyToken, paymentDetailController.createPaymentDetail);
router.post("/checkoutWithMoMo", paymentDetailController.checkoutWithMoMo);
router.post("/callback", paymentDetailController.callbackPaymentDetail);
router.post("/checkStatusTransaction", paymentDetailController.checkStatusTransaction);

export default router;