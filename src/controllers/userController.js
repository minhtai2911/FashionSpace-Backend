import User from "../models/user.js";
import asyncHandler from "../middleware/asyncHandler.js";

const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({});

  if (!users) return res.status(404).json({ message: "Users not found" });

  res.status(200).json(users);
});

const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json(user);
});

const deleteUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json({ message: "User deleted successfully" });
});

const updateUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.full_name = req.body.full_name || user.full_name;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;
  user.password = req.body.password || user.password;
  user.role_id = req.body.role_id || user.role_id;
  //user.refreshToken = req.body.refreshToken || user.refreshToken;

  try {
    await user.save();
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
