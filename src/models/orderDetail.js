import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Order"
  },
  productVariantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "ProductVariant"
  },
  quantity: {
    type: Number,
    required: true,
  }
});

export default mongoose.model("OrderDetail", userSchema);
