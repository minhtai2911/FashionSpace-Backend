import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  status: {
    type: String,
    default: "Unpaid",
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  updatedDate: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("PaymentDetail", userSchema);
