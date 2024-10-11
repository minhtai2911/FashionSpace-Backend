import {Router} from "express";
import reviewController from "../controllers/reviewController.js";

const router = Router();

router.get('/', reviewController.getAllReviews);
router.post('/', reviewController.createReview);
router.get('/:id', reviewController.getReviewById);
router.put('/:id', reviewController.updateReviewById);
router.delete('/:id', reviewController.deleteReviewById);

export default router;