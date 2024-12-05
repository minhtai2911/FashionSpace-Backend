import { Router } from "express";
import reviewResponseController from "../controllers/reviewResponseController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get('/reviewId/:reviewId', reviewResponseController.getReviewResponseByReviewId);
router.post('/', authMiddleware.verifyToken, reviewResponseController.createReviewResponse);
router.put('/:id', authMiddleware.verifyToken, reviewResponseController.updateReviewResponseById);
router.delete('/:id', authMiddleware.verifyToken, reviewResponseController.deleteReviewResponseById);

export default router;