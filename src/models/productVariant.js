import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    size: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProductVariant", userSchema);
