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
  updatedDate: {
    type: Date,
    default: Date.now,
  },
  currentAddress: {
    type: String,
    default: null,
  },
});

export default mongoose.model("OrderTracking", userSchema);
