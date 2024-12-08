import { Router } from "express";
import statisticController from "../controllers/statisticController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post(
  "/",
//   authMiddleware.verifyToken,
//   authMiddleware.checkPermission(["Admin"]),
  statisticController.createStatistic
);

router.get(
  "/",
//   authMiddleware.verifyToken,
//   authMiddleware.checkPermission(["Admin"]),
  statisticController.getStatistics
);

export default router;
