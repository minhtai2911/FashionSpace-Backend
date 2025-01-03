import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  status: {
    type: String,
    default: "Chưa thanh toán",
    enum: ["Đã thanh toán", "Chưa thanh toán", "Đã hoàn tiền"],
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  updatedDate: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("PaymentDetail", userSchema);
