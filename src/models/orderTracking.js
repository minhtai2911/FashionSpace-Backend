import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Order"
  },
  status: {
    type: String,
    default: "Đang chờ",
    enum: [
      "Đang chờ",
      "Đang xử lý",
      "Đã giao",
      "Đang giao",
      "Đã hủy",
      "Trả hàng",
      "Đã nhận đơn",
    ],
  },
  currentStatus: {
    type: Boolean,
    default: true,
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
