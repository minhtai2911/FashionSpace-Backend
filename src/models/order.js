import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  total: {
    type: Number,
    required: true,
  },
  paymentDetailId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "PaymentDetail",
  },
  orderAddressId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "OrderAddress",
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  shippingFee: {
    type: Number,
    required: true,
  }
});

export default mongoose.model("Order", userSchema);
