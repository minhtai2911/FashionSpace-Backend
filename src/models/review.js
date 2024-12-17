import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
  createdDate: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("Review", userSchema);
