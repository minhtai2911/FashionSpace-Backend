import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  status: {
    type: String,
    required: true,
    // enum: ["pending", "processing", "shipped", "delivered", "cancelled"]
  },
  total: {
    type: Number,
    required: true,
  },
  paymentDetailId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "PaymentDetail"
  },
  orderAddressId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "OrderAddress"
  },
  deliveryDate: {
    type: Date,
    default: null,
  },
  createdDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  currentAddress: {
    type: String,
    default: null,
  }
});

export default mongoose.model("Order", userSchema);
