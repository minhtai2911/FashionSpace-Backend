import ReviewResponse from "../models/reviewResponse.js";
import { messages } from "../config/messageHelper.js";

const getReviewResponseByReviewId = async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;

    const reviewResponse = await ReviewResponse.find({ reviewId: reviewId }).sort({ createdDate: -1 }); ;

    if (!reviewResponse)
      return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: reviewResponse });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const createReviewResponse = async (req, res, next) => {
  try {
    const { reviewId, content } = req.body;
    const userId = req.user.id;
    if (!reviewId || !content)
      throw new Error(messages.MSG1);

    const newReviewResponse = new ReviewResponse({ userId, reviewId, content });
    await newReviewResponse.save();
    res
      .status(201)
      .json({ message: messages.MSG45, data: newReviewResponse });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const updateReviewResponseById = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) throw new Error(messages.MSG1);

    const reviewResponse = await ReviewResponse.findById(req.params.id);

    if (!reviewResponse)
      return res.status(404).json({ error: "Not found" });

    reviewResponse.content = content || reviewResponse.content;
    reviewResponse.createdDate = Date.now();
    await reviewResponse.save();
    res.status(200).json(reviewResponse);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const deleteReviewResponseById = async (req, res, next) => {
  try {
    const reviewResponse = await ReviewResponse.findByIdAndDelete(
      req.params.id
    );
    if (!reviewResponse)
      return res.status(404).json({ error: "Not found" });

    res.status(200);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

export default {
  getReviewResponseByReviewId: getReviewResponseByReviewId,
  createReviewResponse: createReviewResponse,
  updateReviewResponseById: updateReviewResponseById,
  deleteReviewResponseById: deleteReviewResponseById,
};
