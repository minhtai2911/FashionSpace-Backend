import asyncHandler from "../middleware/asyncHandler.js";
import ReviewResponse from "../models/reviewResponse.js";

const getReviewResponseByReviewId = asyncHandler(async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;

    const reviewResponse = await ReviewResponse.find({ reviewId: reviewId });

    if (!reviewResponse)
      return res.status(404).json({ message: "Review response not found" });

    res.status(200).json(reviewResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createReviewResponse = asyncHandler(async (req, res, next) => {
  try {
    const { reviewId, content } = req.body;
    const userId = req.user.id;
    if (!reviewId || !content)
      throw new Error("Please fill all required fields");

    const newReviewResponse = new ReviewResponse({ userId, reviewId, content });
    await newReviewResponse.save();
    res.status(201).json(newReviewResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const updateReviewResponseById = asyncHandler(async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) throw new Error("Please fill all required fields");

    const reviewResponse = await ReviewResponse.findById(req.params.id);

    if (!reviewResponse)
      return res.status(404).json({ message: "Review response not found" });

    reviewResponse.content = content || reviewResponse.content;
    reviewResponse.createdDate = Date.now();
    await reviewResponse.save();
    res.status(200).json(reviewResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const deleteReviewResponseById = asyncHandler(async (req, res, next) => {
  try {
    const reviewResponse = await ReviewResponse.findByIdAndDelete(
      req.params.id
    );
    if (!reviewResponse)
      return res.status(404).json({ message: "Review response not found" });
    res.status(200).json({ message: "Review response deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default {
  getReviewResponseByReviewId: getReviewResponseByReviewId,
  createReviewResponse: createReviewResponse,
  updateReviewResponseById: updateReviewResponseById,
  deleteReviewResponseById: deleteReviewResponseById,
};
