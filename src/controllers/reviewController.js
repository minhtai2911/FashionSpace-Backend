import asyncHandler from "../middleware/asyncHandler.js";
import Review from "../models/review.js";

const getAllReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({});

  if (!reviews) return res.status(404).json({ message: "Reviews not found" });

  res.status(200).json(reviews);
});

const createReview = asyncHandler(async (req, res, next) => {
  const { user_id, product_id, rating, content } = req.body;

  if (!user_id || !product_id || !rating || !content) {
    throw new Error("Please fill all required fields");
  }

  const existingReview = await Review.findOne({ user_id, product_id });

  if (!existingReview) {
    throw new Error("Review already exists");
  }

  const newReview = new Review({user_id, product_id, rating, content});

  try {
    await newReview.save();
    res.status(201).json(newReview);
  } catch {
    throw new Error("Invalid new review");
  }
});

const getReviewById = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    
    if (!review) return res.status(404).json({ message: "Review not found" });

    res.status(200).json(review);
});

const updateReviewById = asyncHandler(async (req, res, next) => {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!review) return res.status(404).json({ message: "Review not found" });

    res.status(200).json(review);
});

const deleteReviewById = asyncHandler(async (req, res, next) => {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) return res.status(404).json({ message: "Review not found" });

    res.status(200).json({ message: "Review deleted successfully" });
});

export default {
  getAllReviews: getAllReviews,
  createReview: createReview,
  getReviewById: getReviewById,
  updateReviewById: updateReviewById,
  deleteReviewById: deleteReviewById,
};
