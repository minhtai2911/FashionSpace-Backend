import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/order.js";

const getAllOrders = asyncHandler(async (req, res, next) => {
    const orders = await Order.find({});

    if (!orders) return res.status(404).json({ message: "Orders not found" });
    
    res.status(200).json(orders);
});

const getOrderById = asyncHandler(async (req, res, next) => {
    const orders = await Order.find({ user: req.params.userId });
    
    if (!orders) return res.status(404).json({ message: "Orders not found" });

    res.status(200).json(orders);
});

const createOrder = asyncHandler(async (req, res, next) => {
    const {user_id, status, total} = req.body;

    if (!user_id || !status || !total) throw new Error("Please fill all required fields");
    
    const newOrder = new Order({user_id, status, total});
    
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

    const {user_id, status, total} = req.body;

    order.user_id = user_id || order.user_id;
    order.status = status || order.status;
    order.total = total || order.total;

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
    getAllOrders: getAllOrders,
    getOrderById: getOrderById,
    createOrder: createOrder,
    updateOrderById: updateOrderById,
    deleteOrderById: deleteOrderById,
}