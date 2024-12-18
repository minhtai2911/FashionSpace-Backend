import Order from "../models/order.js";
import OrderTracking from "../models/orderTracking.js";
import chatbotController from "./chatbotController.js";

const getAllOrders = async (req, res, next) => {
  try {
    const query = [];
    if (req.query.orderTrackingStatus)
      query.push({ "orderTracking.status": req.query.orderTrackingStatus });
    if (req.query.paymentMethod)
      query.push({ "paymentDetail.paymentMethod": req.query.paymentMethod });
    if (req.query.paymentStatus)
      query.push({ "paymentDetail.status": req.query.paymentStatus });
    query.push({ "orderTracking.currentStatus": true });
    
    const order = await Order.aggregate([
      {
        $lookup: {
          from: "ordertrackings",
          localField: "_id",
          foreignField: "orderId",
          as: "orderTracking",
        },
      },
      { $unwind: "$orderTracking" },
      {
        $lookup: {
          from: "paymentdetails",
          localField: "paymentDetailId",
          foreignField: "_id",
          as: "paymentDetail",
        },
      },
      { $unwind: "$paymentDetail" },
      {
        $match: {
          $and: query.length > 0 ? query : [{}],
        },
      },
    ]);

    if (!order)
      return res.status(404).json({ error: "Đơn hàng không tồn tại." });

    res.status(200).json({ data: order });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const getOrderByUserId = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const order = await Order.find({ userId: userId });
    if (!order)
      return res.status(404).json({ error: "Đơn hàng không tồn tại." });
    res.status(200).json({ data: order });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ error: "Đơn hàng không tồn tại." });

    res.status(200).json({ data: order });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

const createOrder = async (req, res, next) => {
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

    chatbotController.updateEntityOrderId(newOrder._id);
    await newOrder.save();
    res.status(201).json({ message: "Đặt hàng thành công!", data: newOrder });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
};

export default {
  getAllOrders: getAllOrders,
  getOrderById: getOrderById,
  createOrder: createOrder,
  getOrderByUserId: getOrderByUserId,
};
