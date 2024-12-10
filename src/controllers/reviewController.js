import asyncHandler from "../middleware/asyncHandler.js";
import Review from "../models/review.js";
import Product from "../models/product.js";
import mongoose from "mongoose";

const getReviewsByProductId = asyncHandler(async (req, res, next) => {
  try {
    const reviews = await Review.aggregate([
      {
        $lookup: {
          from: "reviewresponses",
          localField: "_id",
          foreignField: "reviewId",
          as: "reviewResponses",
        },
      },
      {
        $match: {
          productId: new mongoose.Types.ObjectId(req.params.productId),
        },
      },
    ]);

    if (!reviews)
      return res.status(404).json({ error: "Đánh giá không tồn tại." });

    res.status(200).json({ data: reviews });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const getAllReviews = asyncHandler(async (req, res, next) => {
  try {
    const reviews = await Review.aggregate([
      {
        $lookup: {
          from: "reviewresponses",
          localField: "_id",
          foreignField: "reviewId",
          as: "reviewResponses",
        },
      },
    ]);

    if (!reviews)
      return res.status(404).json({ error: "Đánh giá không tồn tại." });

    res.status(200).json({ data: reviews });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const createReview = asyncHandler(async (req, res, next) => {
  try {
    const { productId, rating, content } = req.body;

    const userId = req.user.id;
    if (!productId || !rating) {
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");
    }

    const newReview = new Review({ userId, productId, rating, content });

    await newReview.save();

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    product.totalReview = product.totalReview + 1;
    product.rating =
      (rating + product.rating * (product.totalReview - 1)) /
      product.totalReview;
    await product.save();

    res.status(201).json({
      message: "Đánh giá của bạn đã được gửi thành công!",
      data: newReview,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const getReviewById = asyncHandler(async (req, res, next) => {
  try {
    const review = await Review.aggregate([
      {
        $lookup: {
          from: "reviewresponses",
          localField: "_id",
          foreignField: "reviewId",
          as: "reviewResponses",
        },
      },
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
        },
      },
    ]);

    if (!review)
      return res.status(404).json({ error: "Đánh giá không tồn tại." });

    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const updateReviewById = asyncHandler(async (req, res, next) => {
  try {
    const review = Review.findById(req.params.id);

    if (!review)
      return res.status(404).json({ error: "Đánh giá không tồn tại" });

    const { rating, content } = req.body;

    if (!rating) throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");

    const product = await Product.findById(review.productId);
    product.rating =
      (product.rating * product.totalReview - review.rating + rating) /
      product.totalReview;
    await product.save();

    review.rating = rating || review.rating;
    review.content = content || review.content;
    review.createdAt = Date.now();

    await review.save();

    res.status(200).json({
      message: "Đánh giá của bạn đã được cập nhật thành công!",
      data: review,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const deleteReviewById = asyncHandler(async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review)
      return res.status(404).json({ error: "Đánh giá không tồn tại." });

    const product = await Product.findById(review.productId);
    product.totalReview = product.totalReview - 1;
    product.rating =
      (product.rating * (product.totalReview + 1) - review.rating) /
      product.totalReview;
    await product.save();

    res
      .status(200)
      .json({ message: "Đánh giá của bạn đã được xóa thành công!" });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const getReviewByProductIdAndUserId = asyncHandler(async (req, res, next) => {
  try {
    const review = await Review.aggregate([
      {
        $lookup: {
          from: "reviewresponses",
          localField: "_id",
          foreignField: "reviewId",
          as: "reviewResponses",
        },
      },
      {
        $match: {
          productId: new mongoose.Types.ObjectId(req.params.productId),
          userId: new mongoose.Types.ObjectId(req.user.id),
        },
      },
    ]);

    if (!review)
      return res.status(404).json({ error: "Đánh giá không tồn tại." });

    res.status(200).json({ data: review });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const getReviewsNotReplied = asyncHandler(async (req, res, next) => {
  try {
    const reviews = await Review.aggregate([
      {
        $lookup: {
          from: "reviewresponses",
          localField: "_id",
          foreignField: "reviewId",
          as: "reviewResponses",
        },
      },
      {
        $match: {
          reviewResponses: { $size: 0 },
        },
      },
    ]);

    if (!reviews)
      return res.status(404).json({ error: "Đánh giá không tồn tại" });

    res.status(200).json({ data: reviews });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});
const getReviewsReplied = asyncHandler(async (req, res, next) => {
  try {
    const reviews = await Review.aggregate([
      {
        $lookup: {
          from: "reviewresponses",
          localField: "_id",
          foreignField: "reviewId",
          as: "reviewResponses",
        },
      },
      {
        $match: {
          reviewResponses: { $ne: [] },
        },
      },
    ]);

    if (!reviews)
      return res.status(404).json({ error: "Đánh giá không tồn tại" });

    res.status(200).json({ data: reviews });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

export default {
  getReviewsByProductId,
  createReview: createReview,
  getReviewById: getReviewById,
  updateReviewById: updateReviewById,
  deleteReviewById: deleteReviewById,
  getAllReviews: getAllReviews,
  getReviewByProductIdAndUserId: getReviewByProductIdAndUserId,
  getReviewsNotReplied: getReviewsNotReplied,
  getReviewsReplied: getReviewsReplied,
};
