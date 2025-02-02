import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    sizeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Size",
    },
    colorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Color",
    },
    stock: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProductVariant", userSchema);
