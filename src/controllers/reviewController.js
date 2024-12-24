import Review from "../models/review.js";
import Product from "../models/product.js";
import mongoose from "mongoose";
import { messages } from "../config/messageHelper.js";
import { reviewStatus } from "../config/reviewStatus.js";

// const getReviewsByProductId = asyncHandler(async (req, res, next) => {
//   try {
//     const reviews = await Review.aggregate([
//       {
//         $lookup: {
//           from: "reviewresponses",
//           localField: "_id",
//           foreignField: "reviewId",
//           as: "reviewResponses",
//         },
//       },
//       {
//         $match: {
//           productId: new mongoose.Types.ObjectId(req.params.productId),
//         },
//       },
//       {
//         $sort: { createdDate: -1 },
//       },
//     ]);

//     if (!reviews)
//       return res.status(404).json({ error: "Đánh giá không tồn tại." });

//     res.status(200).json({ data: reviews });
//   } catch (err) {
//     res.status(500).json({
//       error: err.message,
//       message: messages.MSG5,
//     });
//   }
// });

const getAllReviews = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.productId)
      query.productId = new mongoose.Types.ObjectId(req.query.productId);
    if (req.query.rating) query.rating = parseInt(req.query.rating);
    if (req.query.userId)
      query.userId = new mongoose.Types.ObjectId(req.query.userId);
    if (req.query.orderId)
      query.orderId = new mongoose.Types.ObjectId(req.query.orderId);

    if (req.query.status === reviewStatus.NOT_REPLIED) {
      if (Object.keys(query).length !== 0) {
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
              ...query,
            },
          },
          {
            $sort: { createdDate: -1 },
          },
        ]);

        if (!reviews) return res.status(404).json({ error: "Not found" });

        return res.status(200).json({ data: reviews });
      } else {
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
          {
            $sort: { createdDate: -1 },
          },
        ]);

        if (!reviews) return res.status(404).json({ error: "Not found" });

        return res.status(200).json({ data: reviews });
      }
    }
    if (req.query.status === reviewStatus.REPLIED) {
      if (Object.keys(query).length !== 0) {
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
              ...query,
              reviewResponses: { $ne: [] },
            },
          },
          {
            $sort: { createdDate: -1 },
          },
        ]);

        if (!reviews) return res.status(404).json({ error: "Not found" });

        return res.status(200).json({ data: reviews });
      } else {
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
          {
            $sort: { createdDate: -1 },
          },
        ]);

        if (!reviews) return res.status(404).json({ error: "Not found" });

        return res.status(200).json({ data: reviews });
      }
    }

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
        $match: query,
      },
      {
        $sort: { createdDate: -1 },
      },
    ]);

    if (!reviews) return res.status(404).json({ error: "Not found" });

    return res.status(200).json({ data: reviews });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const createReview = async (req, res, next) => {
  try {
    const { productId, rating, content, orderId } = req.body;

    const userId = req.user.id;
    if (!productId || !rating || !orderId || !content) {
      throw new Error(messages.MSG1);
    }

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
      (rating + product.rating * (product.totalReview - 1)) /
      product.totalReview;
    await product.save();

    res.status(201).json({
      message: messages.MSG20,
      data: newReview,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const getReviewById = async (req, res, next) => {
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

    if (!review) return res.status(404).json({ error: "Not found" });

    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const updateReviewById = async (req, res, next) => {
  try {
    const review = Review.findById(req.params.id);

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
    review.createdAt = Date.now();

    await review.save();

    res.status(200).json({
      message: "Đánh giá của bạn đã được cập nhật thành công!",
      data: review,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const deleteReviewById = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) return res.status(404).json({ error: "Not found" });

    const product = await Product.findById(review.productId);
    product.totalReview = product.totalReview - 1;
    product.rating =
      (product.rating * (product.totalReview + 1) - review.rating) /
      product.totalReview;
    await product.save();

    res.status(200);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

// const getReviewByProductIdUserIdAndOrderId = asyncHandler(
//   async (req, res, next) => {
//     try {
//       const review = await Review.aggregate([
//         {
//           $lookup: {
//             from: "reviewresponses",
//             localField: "_id",
//             foreignField: "reviewId",
//             as: "reviewResponses",
//           },
//         },
//         {
//           $match: {
//             productId: new mongoose.Types.ObjectId(req.params.productId),
//             userId: new mongoose.Types.ObjectId(req.user.id),
//             orderId: new mongoose.Types.ObjectId(req.params.orderId),
//           },
//         },
//         {
//           $sort: { createdDate: -1 },
//         },
//       ]);

//       if (!review)
//         return res.status(404).json({ error: "Đánh giá không tồn tại." });

//       res.status(200).json({ data: review });
//     } catch (err) {
//       res.status(500).json({
//         error: err.message,
//         message: messages.MSG5,
//       });
//     }
//   }
// );

// const getReviewsNotReplied = asyncHandler(async (req, res, next) => {
//   try {
//     const reviews = await Review.aggregate([
//       {
//         $lookup: {
//           from: "reviewresponses",
//           localField: "_id",
//           foreignField: "reviewId",
//           as: "reviewResponses",
//         },
//       },
//       {
//         $match: {
//           reviewResponses: { $size: 0 },
//         },
//       },
//       {
//         $sort: { createdDate: 1 },
//       },
//     ]);

//     if (!reviews)
//       return res.status(404).json({ error: "Đánh giá không tồn tại" });

//     res.status(200).json({ data: reviews });
//   } catch (err) {
//     res.status(500).json({
//       error: err.message,
//       message: messages.MSG5,
//     });
//   }
// });
// const getReviewsReplied = asyncHandler(async (req, res, next) => {
//   try {
//     const reviews = await Review.aggregate([
//       {
//         $lookup: {
//           from: "reviewresponses",
//           localField: "_id",
//           foreignField: "reviewId",
//           as: "reviewResponses",
//         },
//       },
//       {
//         $match: {
//           reviewResponses: { $ne: [] },
//         },
//       },
//       {
//         $sort: { createdDate: -1 },
//       },
//     ]);

//     if (!reviews)
//       return res.status(404).json({ error: "Đánh giá không tồn tại" });

//     res.status(200).json({ data: reviews });
//   } catch (err) {
//     res.status(500).json({
//       error: err.message,
//       message: messages.MSG5,
//     });
//   }
// });

export default {
  // getReviewsByProductId,
  createReview: createReview,
  getReviewById: getReviewById,
  updateReviewById: updateReviewById,
  deleteReviewById: deleteReviewById,
  getAllReviews: getAllReviews,
  // getReviewByProductIdUserIdAndOrderId: getReviewByProductIdUserIdAndOrderId,
  // getReviewsNotReplied: getReviewsNotReplied,
  // getReviewsReplied: getReviewsReplied,
};
