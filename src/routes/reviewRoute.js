import {Router} from "express";
import reviewController from "../controllers/reviewController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get('/productId/:productId', reviewController.getReviewsByProductId);
router.post('/', authMiddleware.verifyToken, reviewController.createReview);
router.get('/:id', reviewController.getReviewById);
router.put('/:id', authMiddleware.verifyToken, reviewController.updateReviewById);
router.delete('/:id', authMiddleware.verifyToken, reviewController.deleteReviewById);

export default router;