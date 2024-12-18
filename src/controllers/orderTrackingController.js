import OrderTracking from "../models/orderTracking.js";
import chatbotController from "./chatbotController.js";

const getOrderTrackingByOrderId = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const orderTracking = await OrderTracking.find({ orderId: orderId }).sort({
      date: 1,
    });

    if (!orderTracking)
      return res
        .status(404)
        .json({ error: "Lịch sử giao hàng không tồn tại." });

    res.status(200).json({ data: orderTracking });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const createOrderTracking = async (req, res, next) => {
  try {
    const { orderId, status, currentAddress, expectedDeliveryDate } = req.body;

    if (!orderId || !status || !currentAddress)
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");
    const orderTracking = new OrderTracking({
      orderId,
      status,
      currentAddress,
      expectedDeliveryDate,
    });

    await OrderTracking.updateMany(
      { orderId: orderTracking.orderId },
      { $set: { currentStatus: false } }
    );
    await orderTracking.save();
    res.status(201).json({
      message: "Thông tin theo dõi đơn hàng đã được cập nhật!",
      data: orderTracking,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

export default {
  getOrderTrackingByOrderId: getOrderTrackingByOrderId,
  createOrderTracking: createOrderTracking,
};
