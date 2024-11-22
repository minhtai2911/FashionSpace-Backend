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

const getOrderById = asyncHandler(async (req, res, next) => {
  try {
    const order = await Order.find({ user: req.params.userId });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createOrder = asyncHandler(async (req, res, next) => {
  try {
    const {
      status,
      total,
      paymentDetailId,
      orderAddressId,
      deliveryDate,
    } = req.body;
    const userId = req.user.id;
    if (
      !status ||
      !total ||
      !paymentDetailId ||
      !orderAddressId ||
      !deliveryDate
    )
      throw new Error("Please fill all required fields");

    const newOrder = new Order({
      userId,
      status,
      total,
      paymentDetailId,
      orderAddressId,
      deliveryDate,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const updateOrderById = asyncHandler(async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    const {
      userId,
      status,
      total,
      paymentDetailId,
      orderAddressId,
      deliveryDate,
      currentAddress
    } = req.body;

    order.userId = userId || order.userId;
    order.status = status || order.status;
    order.total = total || order.total;
    order.paymentDetailId = paymentDetailId || order.paymentDetailId;
    order.orderAddressId = orderAddressId || order.orderAddressId;
    order.deliveryDate = deliveryDate || order.deliveryDate;
    order.currentAddress = currentAddress || order.currentAddress;

    await order.save();
    res.status(200).json(order);
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
  updateOrderById: updateOrderById,
  deleteOrderById: deleteOrderById,
};
