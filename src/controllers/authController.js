import User from "../models/user.js";
import UserRole from "../models/userRole.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../middleware/asyncHandler.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import Otp from "../models/otp.js";

const generateOTP = asyncHandler(async (req, res, next) => {
  try {
    const otp = Math.floor(
      100000 + Math.random() * (999999 - 100000)
    ).toString();

    const salt = await bcrypt.genSalt();
    const hashedOTP = await bcrypt.hash(otp, salt);
    const email = req.body.email;

    const otpObj = new Otp({
      email,
      otp: hashedOTP,
    });

    await otpObj.save();
    res.status(200).json({ otp: otp });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const login = asyncHandler(async (req, res, next) => {
  try {
    const email = req.body.email;
    const originalPassword = req.body.password;

    if (!email || !originalPassword) {
      throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");
    }

    const user = await User.login(email, originalPassword);
    const role = await UserRole.findById(user.roleId);

    if (!user.isActive && role.roleName === "Customer") {
      return res.status(400).json({ data: user });
    }

    if (!user.isActive) {
      return res
        .status(400)
        .json({
          message:
            "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ với quản trị viên.",
        });
    }

    const accessToken = jwt.sign(
      { id: user._id, roleId: user.roleId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30s",
      }
    );

    const refreshToken = jwt.sign(
      { id: user._id, roleId: user.roleId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "365d" }
    );

    user.refreshToken = refreshToken;

    await User.findByIdAndUpdate(
      user._id,
      {
        $set: { refreshToken: refreshToken },
      },
      { new: true }
    );

    const { password, ...data } = user._doc;

    return res.status(200).json({
      message: "Đăng nhập thành công!",
      data: { ...data, accessToken },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

const signup = asyncHandler(async (req, res, next) => {
  const { email, fullName, phone, password } = req.body;

  if (!email || !fullName || !phone || !password) {
    throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");
  }
  const exists = await User.findOne({ email: email });

  if (exists) return res.status(409).json({ message: "Email đã tồn tại." });

  const role = await UserRole.findOne({ roleName: "Customer" });
  const roleId = role._id;
  const user = new User({ email, fullName, phone, roleId, password });
  try {
    await user.save();
    const { password, ...data } = user._doc;
    res.status(201).json({ message: "Đăng ký thành công!", data: data });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const sendMailVerifyAccount = asyncHandler(async (req, res, next) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `Fashion Space <${process.env.EMAIL_USER}>`,
      to: `${req.body.email}`,
      subject: "YÊU CẦU XÁC NHẬN THÔNG TIN ĐĂNG KÝ TÀI KHOẢN TỪ FASHION SPACE",
      html: `
      <a href="${process.env.URL_CLIENT}/verify/${req.body.id}">Nhấn vào đây để xác nhận email của bạn.</a>
      `,
    });
    res
      .status(200)
      .json({ message: "Liên kết xác thực đã được gửi thành công!" });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const verifyAccount = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ error: "Người dùng không tồn tại." });

    user.isActive = true;

    const accessToken = jwt.sign(
      { id: user._id, roleId: user.roleId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30s",
      }
    );

    const refreshToken = jwt.sign(
      { id: user._id, roleId: user.roleId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "365d" }
    );

    user.refreshToken = refreshToken;

    await User.findByIdAndUpdate(
      user._id,
      {
        $set: { isActive: true, refreshToken: refreshToken },
      },
      { new: true }
    );

    const { password, ...data } = user._doc;

    res.status(200).json({
      message: "Xác thực tài khoản thành công!",
      data: { ...data, accessToken },
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const logout = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: { refreshToken: "" },
      },
      { new: true }
    );
    res.status(200).json({ message: "Đăng xuất thành công!" });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const refreshToken = asyncHandler(async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
      if (err) {
        return res.status(403).json({ error: "Refresh token không hợp lệ!" });
      }
      const accessToken = jwt.sign(
        { id: data.id, roleId: data.roleId },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "30s",
        }
      );
      return res.json({ accessToken: accessToken });
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const sendOTP = asyncHandler(async (req, res, next) => {
  try {
    const OTP = req.body.OTP;
    const email = req.body.email;
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const info = await transporter.sendMail({
      from: `Fashion Space <${process.env.EMAIL_USER}>`,
      to: `${email}`,
      subject: "YÊU CẦU ĐẶT LẠI MẬT KHẨU TỪ FASHION SPACE",
      html: `
      <div>Chào ${email},</div>
      <div>Chúng tôi đã nhận được yêu cầu để đặt lại mật khẩu của bạn.</div>
      <div>Mã OTP của bạn: <br>${OTP}</br></div>
      `,
    });
    res.status(200).json({
      message: "Mã OTP đã được gửi thành công!",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const checkOTPByEmail = asyncHandler(async (req, res, next) => {
  try {
    const otp = req.body.OTP;
    const email = req.body.email;
    const otpList = await Otp.find({ email: email });

    if (otpList.length < 1) {
      return res.status(400).json({ error: "Không tìm thấy mã OTP." });
    }

    const check = await bcrypt.compare(otp, otpList[otpList.length - 1].otp);

    if (!check) {
      return res.status(400).json({ message: "Mã OTP không hợp lệ!" });
    }

    const user = await User.findOne({ email: email });

    const accessToken = jwt.sign(
      { id: user._id, roleId: user.roleId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30s",
      }
    );

    const refreshToken = jwt.sign(
      { id: user._id, roleId: user.roleId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    await User.findByIdAndUpdate(
      user._id,
      {
        $set: { refreshToken: refreshToken },
      },
      { new: true }
    );

    user.refreshToken = refreshToken;

    const { password, ...data } = user._doc;

    res
      .status(200)
      .json({ message: "Mã OTP hợp lệ!", data: { ...data, accessToken } });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const checkEmail = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại." });
    }

    res.status(200).json({ message: "Email đã tồn tại." });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.password = req.body.newPassword;
    await user.save();
    res.status(200).json({ message: "Đặt lại mật khẩu thành công!" });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const check = await bcrypt.compare(req.body.password, user.password);

    if (!check)
      return res
        .status(400)
        .json({ message: "Mật khẩu cũ không đúng. Vui lòng thử lại!" });

    user.password = req.body.newPassword;
    await user.save();
    res.status(200).json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

const loginGoogleSuccess = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user)
      return res.status(404).json({ error: "Người dùng không tồn tại." });

    const check = await bcrypt.compare(user._id.toString(), req.body.token);

    if (!check)
      return res.status(403).json({
        message:
          "Phiên đăng nhập không hợp lệ. Bạn cần đăng nhập lại để tiếp tục.",
      });

    const { password, ...data } = user._doc;
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: "Đã xảy ra lỗi, vui lòng thử lại!",
    });
  }
});

export default {
  login: login,
  signup: signup,
  logout: logout,
  refreshToken: refreshToken,
  generateOTP: generateOTP,
  sendOTP: sendOTP,
  checkOTPByEmail: checkOTPByEmail,
  checkEmail: checkEmail,
  forgotPassword: forgotPassword,
  resetPassword: resetPassword,
  verifyAccount: verifyAccount,
  sendMailVerifyAccount: sendMailVerifyAccount,
  loginGoogleSuccess: loginGoogleSuccess,
};
