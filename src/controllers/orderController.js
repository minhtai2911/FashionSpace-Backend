import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/order.js";

const getAllOrder = asyncHandler(async (req, res, next) => {
  try {
    const order = await Order.find({});

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getOrderByUserId = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.id;
    const order = await Order.find({ userId: userId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getOrderById = asyncHandler(async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createOrder = asyncHandler(async (req, res, next) => {
  try {
    const { total, paymentDetailId, orderAddressId } = req.body;
    const userId = req.user.id;
    if ( !total || !paymentDetailId || !orderAddressId)
      throw new Error("Please fill all required fields");

    const newOrder = new Order({
      userId,
      total,
      paymentDetailId,
      orderAddressId,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const deleteOrderById = asyncHandler(async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default {
  getAllOrder: getAllOrder,
  getOrderById: getOrderById,
  createOrder: createOrder,
  deleteOrderById: deleteOrderById,
  getOrderByUserId: getOrderByUserId,
};
