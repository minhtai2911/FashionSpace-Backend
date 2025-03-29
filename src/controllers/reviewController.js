import Review from "../models/review.js";
import Product from "../models/product.js";
import mongoose from "mongoose";
import { messages } from "../config/messageHelper.js";
import asyncHandler from "../middleware/asyncHandler.js";
import invalidateCache from "../utils/changeCache.js";

const getAllReviews = asyncHandler(async (req, res, next) => {
  const query = {};
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (req.query.productId)
    query.productId = new mongoose.Types.ObjectId(req.query.productId);
  if (req.query.rating) query.rating = parseInt(req.query.rating);
  if (req.query.userId)
    query.userId = new mongoose.Types.ObjectId(req.query.userId);
  if (req.query.orderId)
    query.orderId = new mongoose.Types.ObjectId(req.query.orderId);
  if (req.query.status) query.status = req.query.status;

  const cacheKey = `reviews:${page}:${limit}:${query.productId || "null"}:${
    query.rating || "null"
  }:${query.userId || "null"}:${query.orderId || "null"}:${
    query.status || "null"
  }`;
  const cachedReviews = await req.redisClient.get(cacheKey);

  if (cachedReviews) {
    return res.status(200).json(JSON.parse(cachedReviews));
  }

  const totalCount = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .sort({ createdDate: -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  const result = {
    meta: {
      totalCount: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    },
    data: reviews,
  };

  await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));
  res.status(200).json(result);
});

const createReview = asyncHandler(async (req, res, next) => {
  const { productId, rating, content, orderId } = req.body;
  const userId = req.user.id;

  if (!productId || !rating || !orderId || !content) {
    throw new Error(messages.MSG1);
  }

  const existingReview = await Review.findOne({
    userId,
    productId,
    orderId,
  });

  if (existingReview) return res.status(409).json({});

  const newReview = new Review({
    userId,
    productId,
    orderId,
    rating,
    content,
  });

  await newReview.save();

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ error: "Not found" });

  product.totalReview = product.totalReview + 1;
  product.rating =
    (rating + product.rating * (product.totalReview - 1)) / product.totalReview;
  await product.save();
  invalidateCache(req, "review", "reviews", newReview._id.toString());

  return res.status(201).json({
    message: messages.MSG20,
    data: newReview,
  });
});

const getReviewById = asyncHandler(async (req, res, next) => {
  const cacheKey = `review:${req.params.id}`;
  const cachedReview = await req.redisClient.get(cacheKey);

  if (cachedReview) {
    return res.status(200).json(JSON.parse(cachedReview));
  }

  const review = await Review.findById(req.params.id);

  if (!review) return res.status(404).json({ error: "Not found" });
  await req.redisClient.setex(cacheKey, 3600, JSON.stringify(review));
  res.status(200).json(review);
});

const updateReviewById = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) return res.status(404).json({ error: "Not found" });

  const { rating, content } = req.body;

  if (!rating) throw new Error(messages.MSG1);

  const product = await Product.findById(review.productId);
  product.rating =
    (product.rating * product.totalReview - review.rating + rating) /
    product.totalReview;
  await product.save();

  review.rating = rating || review.rating;
  review.content = content || review.content;

  await review.save();
  invalidateCache(req, "review", "reviews", review._id.toString());
  res.status(200).json({
    message: messages.MSG59,
    data: review,
  });
});

const deleteReviewById = asyncHandler(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) return res.status(404).json({ error: "Not found" });

  const product = await Product.findById(review.productId);
  product.totalReview = product.totalReview - 1;
  product.rating =
    (product.rating * (product.totalReview + 1) - review.rating) /
    product.totalReview;
  await product.save();
  invalidateCache(req, "review", "reviews", req.params.id);
  res.status(200).json({ message: messages.MSG60 });
});

const createResponse = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const content = req.body.content;
  const reviewId = req.body.reviewId;

  const review = await Review.findById(reviewId);
  if (!review) return res.status(404).json({ error: "Not found" });

  review.response.push({ userId, content });
  review.save();
  invalidateCache(req, "review", "reviews", review._id.toString());
  res.status(200).json({ message: messages.MSG45, data: review });
});

export default {
  createReview: createReview,
  getReviewById: getReviewById,
  updateReviewById: updateReviewById,
  deleteReviewById: deleteReviewById,
  getAllReviews: getAllReviews,
  createResponse: createResponse,
};
