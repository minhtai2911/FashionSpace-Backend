import UserRole from "../models/userRole.js";
import User from "../models/user.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import logger from "../utils/logger.js";

export const initDatabase = asyncHandler(async () => {
  // Create default user roles
  const roles = ["Admin", "Employee", "Customer"];
  for (const role of roles) {
    const userRole = await UserRole.findOne({ roleName: role });
    if (!userRole) {
      await UserRole.create({ roleName: role, description: `${role} role` });
      logger.info(`Default user role created: ${role}`);
    } else {
      logger.info(`Default user role already exists: ${role}`);
    }
  }

  // Create a default admin user
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const user = await User.findOne({ email: adminEmail });
  if (!user) {
    const userRole = await UserRole.findOne({ roleName: "Admin" });
    if (!userRole) {
      logger.error("Admin role does not exist. Cannot create admin user.");
      return;
    }
    const adminUser = new User({
      email: adminEmail,
      fullName: "Admin",
      phone: "0987654321",
      roleId: userRole._id,
      password: adminPassword,
      isActive: true,
    });
    await adminUser.save();
    logger.info(`Default admin user created: ${adminEmail}`);
  } else {
    logger.info(`Default admin user already exists: ${adminEmail}`);
  }
});
