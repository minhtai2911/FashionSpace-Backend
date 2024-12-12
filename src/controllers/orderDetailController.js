import asyncHandler from "../middleware/asyncHandler.js";
import OrderDetail from "../models/orderDetail.js";
import Product from "../models/product.js";
import ProductVariant from "../models/productVariant.js";

const getOrderDetailsByOrderId = asyncHandler(async (req, res, next) => {
  try {
    const orderDetail = await OrderDetail.find({ orderId: req.params.orderId });

    if (!orderDetail)
      return res
        .status(404)
        .json({ error: "Chi tiết đơn hàng không tồn tại." });

    res.status(200).json({ data: orderDetail });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const getOrderDetailById = asyncHandler(async (req, res, next) => {
  try {
    const orderDetail = await OrderDetail.findById(req.params.id);

    if (!orderDetail)
      return res
        .status(404)
        .json({ error: "Chi tiết đơn hàng không tồn tại." });

    res.status(200).json({ data: orderDetail });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const createOrderDetail = asyncHandler(async (req, res, next) => {
  try {
    const { orderId, productVariantId, quantity } = req.body;

    if (!orderId || !productVariantId || !quantity)
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");

    const productVariant = await ProductVariant.findById(productVariantId);

    if (!productVariant)
      return res
        .status(404)
        .json({ error: "Biến thể sản phẩm không tồn tại." });

    if (productVariant.quantity < quantity) {
      const product = await Product.findById(productVariant.productId);
      return res
        .status(409)
        .json({ message: `Sản phẩm ${product.name} không đủ số lượng trong kho.` });
    }

    productVariant.quantity = productVariant.quantity - quantity;
    await productVariant.save();

    const product = await Product.findById(productVariant.productId);

    if (!product)
      return res.status(404).json({ error: "Sản phẩm không tồn tại." });

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
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

export default {
  getOrderDetailsByOrderId: getOrderDetailsByOrderId,
  getOrderDetailById: getOrderDetailById,
  createOrderDetail: createOrderDetail,
};
