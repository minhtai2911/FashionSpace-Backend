import asyncHandler from "../middleware/asyncHandler.js";
import OrderAddress from "../models/orderAddress.js";

const getAllOrderAddresses = asyncHandler(async (req, res, next) => {
  try {
    const orderAddresses = await OrderAddress.find({});

    if (!orderAddresses)
      return res.status(404).json({ message: "Order Addresses not found" });

    res.status(200).json(orderAddresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getOrderAddressById = asyncHandler(async (req, res, next) => {
  try {
    const orderAddress = await OrderAddress.findById(req.params.id);

    if (!orderAddress)
      return res.status(404).json({ message: "Order Address not found" });

    res.status(200).json(orderAddress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createOrderAddress = asyncHandler(async (req, res, next) => {
  try {
    const { city, district, commune, phone } = req.body;

    if (!city || !district || !commune || !phone) {
      throw new Error("Please fill all required fields");
    }

    const newOrderAddress = new OrderAddress({
      city,
      district,
      commune,
      phone,
    });

    await newOrderAddress.save();
    res.status(201).json(newOrderAddress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const updateOrderAddressById = asyncHandler(async (req, res, next) => {
  try {
    const orderAddress = await OrderAddress.findById(req.params.id);

    if (!orderAddress)
      return res.status(404).json({ message: "Order Address not found" });

    const { city, district, commune, phone } = req.body;

    orderAddress.city = city || orderAddress.city;
    orderAddress.district = district || orderAddress.district;
    orderAddress.commune = commune || orderAddress.commune;
    orderAddress.phone = phone || orderAddress.phone;

    await orderAddress.save();
    res.status(200).json(orderAddress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const deleteOrderAddressById = asyncHandler(async (req, res, next) => {
  try {
    const orderAddress = await OrderAddress.findByIdAndDelete(req.params.id);

    if (!orderAddress)
      return res.status(404).json({ message: "Order Address not found" });

    res.status(200).json({ message: "Order Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default {
  getAllOrderAddresses: getAllOrderAddresses,
  getOrderAddressById: getOrderAddressById,
  createOrderAddress: createOrderAddress,
  updateOrderAddressById: updateOrderAddressById,
  deleteOrderAddressById: deleteOrderAddressById,
};
