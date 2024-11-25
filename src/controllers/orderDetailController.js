import asyncHandler from "../middleware/asyncHandler.js";
import OrderDetail from "../models/orderDetail.js";

const getOrderDetailsByOrderId = asyncHandler(async (req, res, next) => {
  try {
    const orderDetail = await OrderDetail.find({ orderId: req.params.orderId });

    if (!orderDetail)
      return res.status(404).json({ message: "Order details not found" });

    res.status(200).json(orderDetail);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getOrderDetailById = asyncHandler(async (req, res, next) => {
  try {
    const orderDetail = await OrderDetail.findById(req.params.id);

    if (!orderDetail)
      return res.status(404).json({ message: "Order detail not found" });

    res.status(200).json(orderDetail);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createOrderDetail = asyncHandler(async (req, res, next) => {
  try {
    const { orderId, productVariantId, quantity } = req.body;

    if (!orderId || !productVariantId || !quantity)
      throw new Error("Please fill in all required fields");

    const newOrderDetail = new OrderDetail({
      orderId,
      productVariantId,
      quantity,
    });
    await newOrderDetail.save();
    res.status(201).json(newOrderDetail);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default {
    getOrderDetailsByOrderId: getOrderDetailsByOrderId,
    getOrderDetailById: getOrderDetailById,
    createOrderDetail: createOrderDetail,
}
