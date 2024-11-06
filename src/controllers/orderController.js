import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/order.js";

const getAllOrder = asyncHandler(async (req, res, next) => {
    const order = await Order.find({});

    if (!order) return res.status(404).json({ message: "Order not found" });
    
    res.status(200).json(order);
});

const getOrderById = asyncHandler(async (req, res, next) => {
    const order = await Order.find({ user: req.params.userId });
    
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json(order);
});

const createOrder = asyncHandler(async (req, res, next) => {
    const {userId, status, total, paymentDetailId, orderAddressId, deliveryDate} = req.body;

    if (!userId || !status || !total || !paymentDetailId || !orderAddressId || !deliveryDate) throw new Error("Please fill all required fields");
    
    const newOrder = new Order({userId, status, total, paymentDetailId, orderAddressId, deliveryDate});
    
    try {
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const updateOrderById = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    const {userId, status, total, paymentDetailId, orderAddressId, deliveryDate} = req.body;

    order.userId = userId || order.userId;
    order.status = status || order.status;
    order.total = total || order.total;
    order.paymentDetailId = paymentDetailId || order.paymentDetailId;
    order.deliveryDate = deliveryDate || order.deliveryDate;

    try {
        await order.save();
        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const deleteOrderById = asyncHandler(async (req, res, next) => {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order deleted successfully" });
});

export default {
    getAllOrder: getAllOrder,
    getOrderById: getOrderById,
    createOrder: createOrder,
    updateOrderById: updateOrderById,
    deleteOrderById: deleteOrderById,
}