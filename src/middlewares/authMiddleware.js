import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(401).json({ message: "Token không hợp lệ!" });
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({
      error: "Bạn chưa được xác thực",
      message: "Phiên của bạn đã hết hạn. Vui lòng đăng nhập lại!",
    });
  }
};

const checkPermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Bạn chưa được xác thực.",
        message: "Phiên của bạn đã hết hạn. Vui lòng đăng nhập lại!",
      });
    }

    if (!permission.includes(req.user.roleName)) {
      return res.status(403).json({
        message:
          "Bạn không có quyền truy cập vào tài nguyên này. Vui lòng liên hệ với quản trị viên.",
      });
    }
    next();
  };
};

export default { verifyToken: verifyToken, checkPermission: checkPermission };
