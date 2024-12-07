import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Order"
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
  date: {
    type: Date,
    default: Date.now,
  },
  currentAddress: {
    type: String,
    default: null,
  },
  expectedDeliveryDate: {
    type: Date,
    default: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});

export default mongoose.model("OrderTracking", userSchema);
