import jwt from "jsonwebtoken";
import UserRole from "../models/userRole.js";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Token is not valid!" });
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({ message: "You are not authenticated!" });
  }
};

const checkPermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authenticated!" });
    }

    const role = await UserRole.findById(req.user.roleId);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    if (!permission.includes(role.roleName)) {
      return res.status(403).json({ message: "You do not have permission!" });
    }
    next();
  };
};

export default { verifyToken: verifyToken, checkPermission: checkPermission };
