import OrderTracking from "../models/orderTracking.js";
import { messages } from "../config/messageHelper.js";
import Product from "../models/product.js";
import ProductVariant from "../models/productVariant.js";
import OrderDetail from "../models/orderDetail.js";
import { orderStatus } from "../config/orderStatus.js";

const getOrderTrackingByOrderId = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const orderTracking = await OrderTracking.find({ orderId: orderId }).sort({
      date: 1,
    });

    if (!orderTracking) return res.status(404).json({ error: "Not found" });

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

    if (!orderId || !status || !currentAddress) throw new Error(messages.MSG1);
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

    if (
      orderTracking.status === orderStatus.CANCELLED ||
      orderTracking.status === orderStatus.RETURNED
    ) {
      const orderDetails = await OrderDetail.find({ orderId: orderId });
      for (let orderDetail of orderDetails) {
        const productVariant = await ProductVariant.findById(
          orderDetail.productVariantId
        );
        productVariant.quantity += orderDetail.quantity;
        await productVariant.save();

        const product = await Product.findById(productVariant.productId);
        product.soldQuantity -= orderDetail.quantity;
        await product.save();
      }
    }

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
