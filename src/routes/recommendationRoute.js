import { Router } from "express";
import recommendationController from "../controllers/recommendationController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/for-you",
  authMiddleware.verifyToken,
  recommendationController.recommendProductsForYou
);
router.get(
  "/similar/:productId",
  recommendationController.recommendSimilarProducts
);

export default router;
