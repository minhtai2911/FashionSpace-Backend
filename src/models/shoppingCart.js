import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  productVariantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductVariant"
  },
  quantity: {
    type: Number,
  },
});

export default mongoose.model("ShoppingCart", userSchema);
