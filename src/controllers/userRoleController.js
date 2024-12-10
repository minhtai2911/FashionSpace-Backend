import asyncHandler from "../middleware/asyncHandler.js";
import UserRole from "../models/userRole.js";

const getAllUserRoles = asyncHandler(async (req, res, next) => {
  try {
    const userRoles = await UserRole.find({});

    if (!userRoles)
      return res.status(404).json({ error: "Vai trò không tồn tại." });

    res.status(200).json({ data: userRoles });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const getUserRoleById = asyncHandler(async (req, res, next) => {
  try {
    const userRole = await UserRole.findById(req.params.id);

    if (!userRole)
      return res.status(404).json({ error: "Vai trò không tồn tại." });

    res.status(200).json({ data: userRole });
  } catch {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const createUserRole = asyncHandler(async (req, res, next) => {
  try {
    const { roleName, description } = req.body;

    if (!roleName || !description) {
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");
    }

    const userRoleExists = await UserRole.findOne({ roleName: roleName });

    if (userRoleExists) {
      res.status(409).json({ message: "Vai trò đã tồn tại." });
    }

    const newUserRole = new UserRole({ roleName, description });

    await newUserRole.save();
    res
      .status(201)
      .json({ message: "Thêm vai trò thành công!", data: newUserRole });
  } catch {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const updateUserRole = asyncHandler(async (req, res, next) => {
  try {
    const userRole = await UserRole.findById(req.params.id);

    if (!userRole) {
      return res.status(404).json({ error: "Vai trò không tồn tại." });
    }

    const { roleName, description } = req.body;

    userRole.roleName = roleName || userRole.roleName;
    userRole.description = description || userRole.description;

    await userRole.save();
    res
      .status(200)
      .json({ message: "Cập nhật vai trò thành công!", data: userRole });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const deleteUserRole = asyncHandler(async (req, res, next) => {
  try {
    const userRole = await UserRole.findByIdAndDelete(req.params.id);

    if (!userRole) {
      return res.status(404).json({ error: "Vai trò không tồn tại." });
    }

    res.status(200).json({ message: "Xóa vai trò thành công!" });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

export default {
  getAllUserRoles: getAllUserRoles,
  getUserRoleById: getUserRoleById,
  createUserRole: createUserRole,
  updateUserRole: updateUserRole,
  deleteUserRole: deleteUserRole,
};
