import mongoose from "mongoose";

const userRoleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const UserRole = mongoose.models.UserRole || mongoose.model("UserRole", userRoleSchema);
export default UserRole;
