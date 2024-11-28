import asyncHandler from "../middleware/asyncHandler.js";
import OrderTracking from "../models/orderTracking.js";

const getOrderTrackingByOrderId = asyncHandler(async (req, res, next) => {
  try {
    const { orderId } = req.params.orderId;
    const orderTracking = await OrderTracking.find({ orderId: orderId });

    if (!orderTracking)
      return res.status(404).json({ message: "Order tracking not found" });

    res.status(200).json(orderTracking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createOrderTracking = asyncHandler(async (req, res, next) => {
  try {
    const { orderId, status, currentAddress } = req.body;

    if (!orderId || !status || !currentAddress)
      throw new Error("Please fill all required fields");
    const orderTracking = new OrderTracking({
      orderId,
      status,
      currentAddress,
    });
    await orderTracking.save();
    res.status(201).json(orderTracking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default {
    getOrderTrackingByOrderId: getOrderTrackingByOrderId,
    createOrderTracking: createOrderTracking,
}
