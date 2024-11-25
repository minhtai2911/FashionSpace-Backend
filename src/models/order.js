import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  status: {
    type: String,
    default: "Pending",
    enum: [
      "Pending",
      "Processing",
      "Shipped",
      "In Delivery",
      "Cancelled",
      "Accepted",
    ],
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
  deliveryDate: {
    type: Date,
    default: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  currentAddress: {
    type: String,
    default: null,
  },
});

export default mongoose.model("Order", userSchema);
