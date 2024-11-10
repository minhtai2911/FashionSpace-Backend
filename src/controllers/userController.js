import User from "../models/user.js";
import asyncHandler from "../middleware/asyncHandler.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

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
    if (req.file) {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.avatarPath) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const deleteStart = user.avatarPath.indexOf("\\avatars\\");
        const deleteFile = "\\public" + user.avatarPath.slice(deleteStart);
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
            fullName: req.body.fullName,
            phone: req.body.phone,
            avatarPath: avatarPath,
          },
        },
        { new: true }
      );
      return res.status(200).json(newUser);
    }

    const newUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          fullName: req.body.fullName,
          phone: req.body.phone,
        },
      },
      { new: true }
    );

    if (!newUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json(newUser);
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
