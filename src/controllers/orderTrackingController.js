import OrderTracking from "../models/orderTracking.js";
import chatbotController from "./chatbotController.js";
import { messages } from "../config/messageHelper.js";

const getOrderTrackingByOrderId = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const orderTracking = await OrderTracking.find({ orderId: orderId }).sort({
      date: 1,
    });

    if (!orderTracking)
      return res
        .status(404)
        .json({ error: "Not found" });

    res.status(200).json({ data: orderTracking });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const createOrderTracking = async (req, res, next) => {
  try {
    const { orderId, status, currentAddress, expectedDeliveryDate } = req.body;

    if (!orderId || !status || !currentAddress)
      throw new Error(messages.MSG1);
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
      message: messages.MSG44,
      data: orderTracking,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

export default {
  getOrderTrackingByOrderId: getOrderTrackingByOrderId,
  createOrderTracking: createOrderTracking,
};
