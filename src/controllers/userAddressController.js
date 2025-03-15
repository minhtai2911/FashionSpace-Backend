import UserAddress from "../models/userAddress.js";
import { messages } from "../config/messageHelper.js";

const createUserAddress = async (req, res, next) => {
  try {
    const { userId, city, district, commune, street, phone } = req.body;

    if (!city || !district || !commune || !street || !phone) {
      throw new Error(messages.MSG1);
    }

    const newUserAddress = new UserAddress({
      city,
      district,
      commune,
      street,
      phone,
      userId,
    });

    newUserAddress.save();
    return res.status(201).json({ data: newUserAddress });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const updateUserAddressById = async (req, res, next) => {
  try {
    const updateUserAddress = await UserAddress.findById(req.params.id);
    const { userId, city, district, commune, street, phone } = req.body;

    updateUserAddress.userId = userId || updateUserAddress.userId;
    updateUserAddress.city = city || updateUserAddress.city;
    updateUserAddress.district = district || updateUserAddress.district;
    updateUserAddress.commune = commune || updateUserAddress.commune;
    updateUserAddress.street = street || updateUserAddress.street;
    updateUserAddress.phone = phone || updateUserAddress.phone;

    await updateUserAddress.save();
    return res.status(200).json({ data: updateUserAddress });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const getUserAddressById = async (req, res, next) => {
  try {
    const userAddress = await UserAddress.findById(req.params.id);

    if (!userAddress) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: userAddress });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

export default {
  createUserAddress: createUserAddress,
  updateUserAddressById: updateUserAddressById,
  getUserAddressById: getUserAddressById,
};
