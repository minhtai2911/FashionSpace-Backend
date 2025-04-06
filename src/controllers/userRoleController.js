import UserRole from "../models/userRole.js";
import { messages } from "../config/messageHelper.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const getAllUserRoles = asyncHandler(async (req, res, next) => {
  const query = {};
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (req.query.search) query.roleName = new RegExp(req.query.search, "i");

  const totalCount = await UserRole.countDocuments(query);
  const userRoles = await UserRole.find(query).skip(skip).limit(limit).exec();

  res.status(200).json({
    meta: {
      totalCount: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    },
    data: userRoles,
  });
});

const getUserRoleById = asyncHandler(async (req, res, next) => {
  const userRole = await UserRole.findById(req.params.id);

  if (!userRole) return res.status(404).json({ error: "Not found" });

  res.status(200).json({ data: userRole });
});

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
