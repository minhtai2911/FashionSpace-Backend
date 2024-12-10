import asyncHandler from "../middleware/asyncHandler.js";
import OrderAddress from "../models/orderAddress.js";

const getAllOrderAddresses = asyncHandler(async (req, res, next) => {
  try {
    const orderAddresses = await OrderAddress.find({});

    if (!orderAddresses)
      return res
        .status(404)
        .json({ error: "Địa chỉ giao hàng không tồn tại." });

    res.status(200).json({ data: orderAddresses });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const getOrderAddressById = asyncHandler(async (req, res, next) => {
  try {
    const orderAddress = await OrderAddress.findById(req.params.id);

    if (!orderAddress)
      return res
        .status(404)
        .json({ error: "Địa chỉ giao hàng không tồn tại." });

    res.status(200).json({ data: orderAddress });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const createOrderAddress = asyncHandler(async (req, res, next) => {
  try {
    const { city, district, commune, phone, street } = req.body;

    if (!city || !district || !commune || !phone || !street) {
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");
    }

    const newOrderAddress = new OrderAddress({
      city,
      district,
      commune,
      phone,
      street,
    });

    await newOrderAddress.save();
    res.status(201).json({ data: newOrderAddress });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const updateOrderAddressById = asyncHandler(async (req, res, next) => {
  try {
    const orderAddress = await OrderAddress.findById(req.params.id);

    if (!orderAddress)
      return res
        .status(404)
        .json({ error: "Địa chỉ giao hàng không tồn tại." });

    const { city, district, commune, phone, street } = req.body;

    orderAddress.city = city || orderAddress.city;
    orderAddress.district = district || orderAddress.district;
    orderAddress.commune = commune || orderAddress.commune;
    orderAddress.phone = phone || orderAddress.phone;
    orderAddress.street = street || orderAddress.street;

    await orderAddress.save();
    res.status(200).json({ data: orderAddress });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

const deleteOrderAddressById = asyncHandler(async (req, res, next) => {
  try {
    const orderAddress = await OrderAddress.findByIdAndDelete(req.params.id);

    if (!orderAddress)
      return res.status(404).json({ error: "Địa chỉ giao hàng không tồn tại." });

    res.status(200).json({ success: "Xóa địa chỉ giao hàng thành công!" });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!",
      });
  }
});

export default {
  getAllOrderAddresses: getAllOrderAddresses,
  getOrderAddressById: getOrderAddressById,
  createOrderAddress: createOrderAddress,
  updateOrderAddressById: updateOrderAddressById,
  deleteOrderAddressById: deleteOrderAddressById,
};
