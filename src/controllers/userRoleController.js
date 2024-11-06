import asyncHandler from "../middleware/asyncHandler.js";
import UserRole from "../models/userRole.js";

const getAllUserRoles = asyncHandler(async (req, res, next) => {
  const userRoles = await UserRole.find({});

  if (!userRoles)
    return res.status(404).json({ message: "User Roles not found" });

  res.status(200).json(userRoles);
});

const getUserRoleById = asyncHandler(async (req, res, next) => {
  const userRole = await UserRole.findById(req.params.id);

  if (!userRole)
    return res.status(404).json({ message: "User Role not found" });

  res.status(200).json(userRole);
});

const createUserRole = asyncHandler(async (req, res, next) => {
  const { roleName, description } = req.body;

  if (!roleName || !description) {
    throw new Error("Please fill in all required fields");
  }

  const userRoleExists = await UserRole.findOne({ roleName: roleName });

  if (userRoleExists) {
    throw new Error("User Role already exists");
  }

  const newUserRole = new UserRole({ roleName, description });

  try {
    await newUserRole.save();
    res.status(201).json(newUserRole);
  } catch {
    res.status(500).json({ message: err.message });
  }
});

const updateUserRole = asyncHandler(async (req, res, next) => {
  const userRole = await UserRole.findById(req.params.id);

  if (!userRole) {
    return res.status(404).json({ message: "User not found" });
  }

  const { roleName, description } = req.body;

  userRole.roleName = roleName || userRole.roleName;
  userRole.description = description || userRole.description;

  try {
    await userRole.save();
    res.status(200).json(userRole);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const deleteUserRole = asyncHandler(async (req, res, next) => {
  const userRole = await UserRole.findByIdAndDelete(req.params.id);

  if (!userRole) {
    return res.status(404).json({ message: "User Role not found" });
  }

  res.status(200).json({ message: "User Role deleted successfully" });
});

export default {
  getAllUserRoles: getAllUserRoles,
  getUserRoleById: getUserRoleById,
  createUserRole: createUserRole,
  updateUserRole: updateUserRole,
  deleteUserRole: deleteUserRole,
};
