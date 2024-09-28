import asyncHandler from "../middleware/asyncHandler.js";
import User_Address from "../models/userAddress.js";

const getAllUserAddresses = asyncHandler(async (req, res, next) => {
    const userAddresses = await User_Address.find({});

    if (!userAddresses) return res.status(404).json({ message: "User Addresses not found" });

    res.status(200).json(userAddresses);
});

const getUserAddressById = asyncHandler(async (req, res, next) => {
    const userAddress = await User_Address.findById(req.params.id);

    if (!userAddress) return res.status(404).json({ message: "User Address not found" });

    res.status(200).json(userAddress);
});

const createUserAddress = asyncHandler(async (req, res, next) => {
    const {user_id, address, city, phone} = req.body;

    if (!user_id || !address || !city || !phone) {
        throw new Error("Please fill all required fields");
    }

    const newUserAddress = new User_Address({user_id, address, city, phone});

    try {
        await newUserAddress.save();
        res.status(201).json(newUserAddress);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

const updateUserAddressById = asyncHandler(async (req, res, next) => {
    const userAddress = await User_Address.findById(req.params.id);
    
    if (!userAddress) return res.status(404).json({ message: "User Address not found" });

    const {user_id, address, city, phone} = req.body;

    userAddress.user_id = user_id || userAddress.user_id;
    userAddress.address = address || userAddress.address;
    userAddress.city = city || userAddress.city;
    userAddress.phone = phone || userAddress.phone;

    try {
        await userAddress.save();
        res.status(200).json(userAddress);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

const deleteUserAddressById = asyncHandler(async (req, res, next) => {
    const userAddress = await User_Address.findByIdAndDelete(req.params.id);

    if (!userAddress) return res.status(404).json({ message: "User Address not found" });

    res.status(200).json({ message: "User Address deleted successfully" });
});

export default {
    getAllUserAddresses: getAllUserAddresses,
    getUserAddressById: getUserAddressById,
    createUserAddress: createUserAddress,
    updateUserAddressById: updateUserAddressById,
    deleteUserAddressById: deleteUserAddressById,
}