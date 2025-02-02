import OrderDetail from "../models/orderDetail.js";
import Product from "../models/product.js";
import ProductVariant from "../models/productVariant.js";
import { messages } from "../config/messageHelper.js";

const getOrderDetailsByOrderId = async (req, res, next) => {
  try {
    const orderDetail = await OrderDetail.find({ orderId: req.params.orderId });

    if (!orderDetail)
      return res
        .status(404)
        .json({ error: "Not found" });

    res.status(200).json({ data: orderDetail });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const getOrderDetailById = async (req, res, next) => {
  try {
    const orderDetail = await OrderDetail.findById(req.params.id);

    if (!orderDetail)
      return res
        .status(404)
        .json({ error: "Not found" });

    res.status(200).json({ data: orderDetail });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const createOrderDetail = async (req, res, next) => {
  try {
    const { orderId, productVariantId, quantity } = req.body;

    if (!orderId || !productVariantId || !quantity)
      throw new Error(messages.MSG1);

    const productVariant = await ProductVariant.findById(productVariantId);

    if (!productVariant)
      return res
        .status(404)
        .json({ error: "Not found" });

    if (productVariant.quantity < quantity) {
      const product = await Product.findById(productVariant.productId);
      return res
        .status(409)
        .json({ message: messages.MSG46 });
    }

    productVariant.quantity = productVariant.quantity - quantity;
    await productVariant.save();

    const product = await Product.findById(productVariant.productId);

    if (!product)
      return res.status(404).json({ error: "Not found" });

    product.soldQuantity = product.soldQuantity + quantity;
    await product.save();

    const newOrderDetail = new OrderDetail({
      orderId,
      productVariantId,
      quantity,
    });

    await newOrderDetail.save();
    res.status(201).json({ data: newOrderDetail });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

export default {
  getOrderDetailsByOrderId: getOrderDetailsByOrderId,
  getOrderDetailById: getOrderDetailById,
  createOrderDetail: createOrderDetail,
};
