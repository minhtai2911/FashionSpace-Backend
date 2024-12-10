import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/order.js";
import OrderTracking from "../models/orderTracking.js";

const getAllOrder = asyncHandler(async (req, res, next) => {
  try {
    const order = await Order.find({});

    if (!order)
      return res.status(404).json({ error: "Đơn hàng không tồn tại." });

    res.status(200).json({ data: order });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const getOrderByUserId = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.id;
    const order = await Order.find({ userId: userId });
    if (!order)
      return res.status(404).json({ error: "Đơn hàng không tồn tại." });
    res.status(200).json({ data: order });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const getOrderById = asyncHandler(async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ error: "Đơn hàng không tồn tại." });

    res.status(200).json({ data: order });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const createOrder = asyncHandler(async (req, res, next) => {
  try {
    const { total, paymentDetailId, orderAddressId, shippingFee } = req.body;
    const userId = req.user.id;
    if (
      !total ||
      !paymentDetailId ||
      !orderAddressId ||
      shippingFee === undefined ||
      shippingFee === null
    )
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");

    const newOrder = new Order({
      userId,
      total,
      paymentDetailId,
      orderAddressId,
      shippingFee,
    });

    const newOrderTracking = new OrderTracking({
      orderId: newOrder._id,
    });

    await newOrderTracking.save();

    await newOrder.save();
    res.status(201).json({ message: "Đặt hàng thành công!", data: newOrder });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const deleteOrderById = asyncHandler(async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order)
      return res.status(404).json({ error: "Đơn hàng không tồn tại." });

    res.status(200).json({ success: "Xóa đơn hàng thành công!" });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

export default {
  getAllOrder: getAllOrder,
  getOrderById: getOrderById,
  createOrder: createOrder,
  deleteOrderById: deleteOrderById,
  getOrderByUserId: getOrderByUserId,
};
