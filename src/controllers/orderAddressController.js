import OrderAddress from "../models/orderAddress.js";
import { messages } from "../config/messageHelper.js";

const getAllOrderAddresses = async (req, res, next) => {
  try {
    const orderAddresses = await OrderAddress.find({});

    if (!orderAddresses)
      return res
        .status(404)
        .json({ error: "Not found" });

    res.status(200).json({ data: orderAddresses });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: messages.MSG5,
      });
  }
};

const getOrderAddressById = async (req, res, next) => {
  try {
    const orderAddress = await OrderAddress.findById(req.params.id);

    if (!orderAddress)
      return res
        .status(404)
        .json({ error: "Not found" });

    res.status(200).json({ data: orderAddress });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: messages.MSG5,
      });
  }
};

const createOrderAddress = async (req, res, next) => {
  try {
    const { city, district, commune, phone, street } = req.body;

    if (!city || !district || !commune || !phone || !street) {
      throw new Error(messages.MSG1);
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
        message: messages.MSG5,
      });
  }
};

const updateOrderAddressById = async (req, res, next) => {
  try {
    const orderAddress = await OrderAddress.findById(req.params.id);

    if (!orderAddress)
      return res
        .status(404)
        .json({ error: "Not found" });

    const { city, district, commune, phone, street } = req.body;

    orderAddress.city = city || orderAddress.city;
    orderAddress.district = district || orderAddress.district;
    orderAddress.commune = commune || orderAddress.commune;
    orderAddress.phone = phone || orderAddress.phone;
    orderAddress.street = street || orderAddress.street;

    await orderAddress.save();
    res.status(200).json({message: messages.MSG21, data: orderAddress });
  } catch (err) {
    res
      .status(500)
      .json({
        error: err.message,
        message: messages.MSG5,
      });
  }
};

// const deleteOrderAddressById = async (req, res, next) => {
//   try {
//     const orderAddress = await OrderAddress.findByIdAndDelete(req.params.id);

//     if (!orderAddress)
//       return res.status(404).json({ error: "Not found" });

//     res.status(200).json({ message: "Xóa địa chỉ giao hàng thành công!" });
//   } catch (err) {
//     res
//       .status(500)
//       .json({
//         error: err.message,
//         message: messages.MSG5,
//       });
//   }
// };

export default {
  getAllOrderAddresses: getAllOrderAddresses,
  getOrderAddressById: getOrderAddressById,
  createOrderAddress: createOrderAddress,
  updateOrderAddressById: updateOrderAddressById,
  // deleteOrderAddressById: deleteOrderAddressById,
};
