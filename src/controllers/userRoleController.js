import UserRole from "../models/userRole.js";
import { messages } from "../config/messageHelper.js";

const getAllUserRoles = async (req, res, next) => {
  try {
    const userRoles = await UserRole.find({});

    if (!userRoles)
      return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: userRoles });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const getUserRoleById = async (req, res, next) => {
  try {
    const userRole = await UserRole.findById(req.params.id);

    if (!userRole)
      return res.status(404).json({ error: "Not found" });

    res.status(200).json({ data: userRole });
  } catch {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

// const createUserRole = async (req, res, next) => {
//   try {
//     const { roleName, description } = req.body;

//     if (!roleName || !description) {
//       throw new Error(messages.MSG1);
//     }

//     const userRoleExists = await UserRole.findOne({ roleName: roleName });

//     if (userRoleExists) {
//       res.status(409).json({ error: "Not found" });
//     }

//     const newUserRole = new UserRole({ roleName, description });

//     await newUserRole.save();
//     res
//       .status(201)
//       .json({ message: "Thêm vai trò thành công!", data: newUserRole });
//   } catch {
//     res.status(500).json({
//       error: err.message,
//       message: messages.MSG5,
//     });
//   }
// };

// const updateUserRole = async (req, res, next) => {
//   try {
//     const userRole = await UserRole.findById(req.params.id);

//     if (!userRole) {
//       return res.status(404).json({ error: "Not found" });
//     }

//     const { roleName, description } = req.body;

//     userRole.roleName = roleName || userRole.roleName;
//     userRole.description = description || userRole.description;

//     await userRole.save();
//     res
//       .status(200)
//       .json({ message: "Chỉnh sửa vai trò thành công!", data: userRole });
//   } catch (err) {
//     res.status(500).json({
//       error: err.message,
//       message: messages.MSG5,
//     });
//   }
// };

// const deleteUserRole = async (req, res, next) => {
//   try {
//     const userRole = await UserRole.findByIdAndDelete(req.params.id);

//     if (!userRole) {
//       return res.status(404).json({ error: "Vai trò không tồn tại." });
//     }

//     res.status(200).json({ message: "Xóa vai trò thành công!" });
//   } catch (err) {
//     res.status(500).json({
//       error: err.message,
//       message: messages.MSG5,
//     });
//   }
// };

export default {
  getAllUserRoles: getAllUserRoles,
  getUserRoleById: getUserRoleById,
  // createUserRole: createUserRole,
  // updateUserRole: updateUserRole,
  // deleteUserRole: deleteUserRole,
};
