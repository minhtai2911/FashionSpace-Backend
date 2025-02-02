import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    deliveryInfo: [
      {
        status: {
          type: String,
          default: "Đang chờ",
          enum: [
            "Đang chờ",
            "Đang xử lý",
            "Đã giao",
            "Đang giao",
            "Đã hủy",
            "Đã trả hàng",
            "Đã nhận đơn",
          ],
        },
        deliveryAddress: {
          type: String,
          default: null,
        },
      },
    ],
    expectedDeliveryDate: {
      type: Date,
      default: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

export default mongoose.model("OrderTracking", userSchema);
