import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderItem: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        productVariantId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "ProductVariant",
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    userAddressId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "UserAddress",
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      default: "Chưa thanh toán",
      enum: ["Đã thanh toán", "Chưa thanh toán", "Đã hoàn tiền"],
    },
    paymentMethod: {
      type: String,
      required: true,
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
        "Đã trả hàng",
        "Đã nhận đơn",
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", userSchema);
