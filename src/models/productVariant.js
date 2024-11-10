import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: true,
  }
});

export default mongoose.model("ProductVariant", userSchema);
