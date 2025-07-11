import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    rating: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: "Chưa trả lời",
      enum: ["Chưa trả lời", "Đã trả lời"],
    },
    response: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "User",
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Tiêu cực", "Tích cực", "Trung lập"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
