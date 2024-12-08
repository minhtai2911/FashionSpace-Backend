import asyncHandler from "../middleware/asyncHandler.js";
import Review from "../models/review.js";
import Product from "../models/product.js";

const getReviewsByProductId = asyncHandler(async (req, res, next) => {
  try {
    const review = await Review.find({ productId: req.params.productId });

    if (!review) return res.status(404).json({ message: "Reviews not found" });

    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getAllReviews = asyncHandler(async (req, res, next) => {
  try {
    const reviews = await Review.find({});
    if (!reviews) return res.status(404).json({ message: "Reviews not found" });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createReview = asyncHandler(async (req, res, next) => {
  try {
    const { productId, rating, content } = req.body;

    const userId = req.user.id;
    if (!productId || !rating) {
      throw new Error("Please fill all required fields");
    }

    const newReview = new Review({ userId, productId, rating, content });

    await newReview.save();

    const product = await Product.findById(productId);
    product.totalReview = product.totalReview + 1;
    product.rating =
      (rating + product.rating * (product.totalReview - 1)) /
      product.totalReview;
    await product.save();

    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getReviewById = asyncHandler(async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ message: "Review not found" });

    res.status(200).json(review);
  } catch {
    res.status(500).json({ message: err.message });
  }
});

const updateReviewById = asyncHandler(async (req, res, next) => {
  try {
    const review = Review.findById(req.params.id);

    if (!review) return res.status(404).json({ message: "Review not found" });

    const { rating, content } = req.body;

    if (!rating) throw new Error("Please fill all required fields");

    const product = await Product.findById(review.productId);
    product.rating =
      (product.rating * product.totalReview - review.rating + rating) /
      product.totalReview;
    await product.save();

    review.rating = rating || review.rating;
    review.content = content || review.content;
    review.createdAt = Date.now();

    await review.save();

    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const deleteReviewById = asyncHandler(async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) return res.status(404).json({ message: "Review not found" });

    const product = await Product.findById(review.productId);
    product.totalReview = product.totalReview - 1;
    product.rating =
      (product.rating * (product.totalReview + 1) - review.rating) /
      product.totalReview;
    await product.save();

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getReviewByProductIdAndUserId = asyncHandler(async (req, res, next) => {
  try {
    const review = await Review.find({
      productId: req.params.productId,
      userId: req.user.id,
    });

    if (!review) return res.status(404).json({ message: "Review not found" });

    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
};
