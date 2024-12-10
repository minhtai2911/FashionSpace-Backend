import asyncHandler from "../middleware/asyncHandler.js";
import ReviewResponse from "../models/reviewResponse.js";

const getReviewResponseByReviewId = asyncHandler(async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;

    const reviewResponse = await ReviewResponse.find({ reviewId: reviewId });

    if (!reviewResponse)
      return res.status(404).json({ error: "Phản hồi không tồn tại." });

    res.status(200).json({ data: reviewResponse });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const createReviewResponse = asyncHandler(async (req, res, next) => {
  try {
    const { reviewId, content } = req.body;
    const userId = req.user.id;
    if (!reviewId || !content)
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");

    const newReviewResponse = new ReviewResponse({ userId, reviewId, content });
    await newReviewResponse.save();
    res
      .status(201)
      .json({ message: "Phản hồi thành công!", data: newReviewResponse });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const updateReviewResponseById = asyncHandler(async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");

    const reviewResponse = await ReviewResponse.findById(req.params.id);

    if (!reviewResponse)
      return res.status(404).json({ error: "Phản hồi không tồn tại." });

    reviewResponse.content = content || reviewResponse.content;
    reviewResponse.createdDate = Date.now();
    await reviewResponse.save();
    res.status(200).json(reviewResponse);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const deleteReviewResponseById = asyncHandler(async (req, res, next) => {
  try {
    const reviewResponse = await ReviewResponse.findByIdAndDelete(
      req.params.id
    );
    if (!reviewResponse)
      return res.status(404).json({ error: "Phản hồi không tồn tại" });

    res.status(200).json({ message: "Phản hồi đã được xóa thành công!" });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

export default {
  getReviewResponseByReviewId: getReviewResponseByReviewId,
  createReviewResponse: createReviewResponse,
  updateReviewResponseById: updateReviewResponseById,
  deleteReviewResponseById: deleteReviewResponseById,
};
