import User from "../models/user.js";
import asyncHandler from "../middleware/asyncHandler.js";

const getAllUsers = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.find({});

    if (!user) return res.status(404).json({ message: "Users not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const getUserById = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const deleteUserById = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const updateUserById = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      $set: {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default {
  getAllUsers: getAllUsers,
  getUserById: getUserById,
  deleteUserById: deleteUserById,
  updateUserById: updateUserById,
};
