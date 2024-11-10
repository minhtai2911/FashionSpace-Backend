import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  }
});

export default mongoose.model("PaymentDetail", userSchema);
