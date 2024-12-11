import User from "../models/user.js";
import asyncHandler from "../middleware/asyncHandler.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import UserRole from "../models/userRole.js";

const getAllUsers = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.find({});

    if (!user)
      return res.status(404).json({ error: "Người dùng không tồn tại." });

    res.status(200).json({ data: user });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const getUserById = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ error: "Người dùng không tồn tại." });

    res.status(200).json({ data: user });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const updateStatusUserById = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ error: "Người dùng không tồn tại." });

    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isActive: !user.isActive,
        },
      },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Lưu trữ người dùng thành công!", data: updateUser });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const updateUserById = asyncHandler(async (req, res, next) => {
  try {
    const role = await UserRole.findById(req.user.roleId);
    if (req.user.id !== req.params.id && role.roleName !== "Admin")
      return res.status(403).json({
        message:
          "Bạn không có quyền truy cập vào tài nguyên này. Vui lòng liên hệ với quản trị viên.",
      });

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ error: "Người dùng không tồn tại." });

    if (req.file) {
      if (user.avatarPath) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const deleteStart = user.avatarPath.indexOf("\\avatars\\");
        const deleteFile = "\\public" + user.avatarPath.slice(deleteStart);

        if ("\\public\\avatars\\avatar.jpg" != deleteFile)
          fs.unlinkSync(path.join(__dirname, "..", deleteFile));
      }
      let filePath = req.file.path;
      const start = filePath.indexOf("\\avatars\\");
      filePath = filePath.slice(start);
      const avatarPath = path.join(process.env.URL_SERVER, filePath);

      const newUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            fullName: req.body.fullName || user.fullName,
            phone: req.body.phone || user.phone,
            avatarPath: avatarPath,
            roleId: req.body.roleId || user.roleId,
          },
        },
        { new: true }
      );
      return res.status(200).json({
        message: "Chỉnh sửa thông tin người dùng thành công!",
        data: newUser,
      });
    }

    const newUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          fullName: req.body.fullName || user.fullName,
          phone: req.body.phone || user.phone,
          roleId: req.body.roleId || user.roleId,
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Chỉnh sửa thông tin người dùng thành công!",
      data: newUser,
    });
  } catch (err) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    fs.unlinkSync(path.join(__dirname, "../..", req.file.path));
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const createUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, fullName, phone, password, roleName } = req.body;
    if (!email || !fullName || !phone || !password || !roleName) {
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");
    }
    const exists = await User.findOne({ email: email });
    if (exists) return res.status(400).json({ message: "Email đã tồn tại." });
    const role = await UserRole.findOne({ roleName: roleName });
    if (!role) return res.status(400).json({ error: "Vai trò không tồn tại." });
    const roleId = role._id;
    const newUser = new User({ email, fullName, phone, roleId, password });
    await newUser.save();
    res
      .status(201)
      .json({ message: "Thêm người dùng thành công!", data: newUser });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

export default {
  getAllUsers: getAllUsers,
  getUserById: getUserById,
  updateStatusUserById: updateStatusUserById,
  updateUserById: updateUserById,
  createUser: createUser,
};
