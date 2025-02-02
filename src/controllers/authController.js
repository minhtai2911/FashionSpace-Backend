import User from "../models/user.js";
import UserRole from "../models/userRole.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import Otp from "../models/otp.js";
import { messages } from "../config/messageHelper.js";

const generateOTP = async (req, res, next) => {
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
      message: messages.MSG5,
    });
  }
};

const login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const originalPassword = req.body.password;

    if (!email || !originalPassword) {
      throw new Error(messages.MSG1);
    }

    const user = await User.login(email, originalPassword);
    const role = await UserRole.findById(user.roleId);

    if (!user.isActive && role.roleName === "Customer") {
      return res.status(400).json({ data: user });
    }

    if (!user.isActive) {
      return res.status(400).json({
        message: messages.MSG53,
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
      message: messages.MSG3,
      data: { ...data, accessToken },
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const signup = async (req, res, next) => {
  const { email, fullName, phone, password } = req.body;

  if (!email || !fullName || !phone || !password) {
    throw new Error(messages.MSG1);
  }
  const exists = await User.findOne({ email: email });

  if (exists) return res.status(409).json({ message: messages.MSG51 });

  const role = await UserRole.findOne({ roleName: "Customer" });
  const roleId = role._id;
  const user = new User({ email, fullName, phone, roleId, password });
  try {
    await user.save();
    const { password, ...data } = user._doc;
    res.status(201).json({ message: messages.MSG16, data: data });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const sendMailVerifyAccount = async (req, res, next) => {
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
    res.status(200).json({ message: messages.MSG4 });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const verifyAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ error: "Not found" });

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
      data: { ...data, accessToken },
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const logout = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: { refreshToken: "" },
      },
      { new: true }
    );
    res.status(200).json({ message: messages.MSG7 });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
      if (err) {
        return res.status(403).json({ error: "Refresh token is invalid!" });
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
      message: messages.MSG5,
    });
  }
};

const sendOTP = async (req, res, next) => {
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
      message: messages.MSG9,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const checkOTPByEmail = async (req, res, next) => {
  try {
    const otp = req.body.OTP;
    const email = req.body.email;
    const otpList = await Otp.find({ email: email });

    if (otpList.length < 1) {
      return res.status(400).json({ error: "Không tìm thấy mã OTP." });
    }

    const check = await bcrypt.compare(otp, otpList[otpList.length - 1].otp);

    if (!check) {
      return res.status(400).json({ message: messages.MSG10 });
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

    res.status(200).json({ data: { ...data, accessToken } });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const checkEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: messages.MSG8 });
    }

    res.status(200).json({ message: messages.MSG51 });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.password = req.body.newPassword;
    await user.save();
    res.status(200).json({ message: messages.MSG11 });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const check = await bcrypt.compare(req.body.password, user.password);

    if (!check) return res.status(400).json({ message: messages.MSG13 });

    user.password = req.body.newPassword;
    await user.save();
    res.status(200).json({ message: messages.MSG14 });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

const loginGoogleSuccess = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(404).json({ error: "Not found" });

    const check = await bcrypt.compare(user._id.toString(), req.body.token);

    if (!check)
      return res.status(403).json({
        message: "Token expired",
      });

    const { password, ...data } = user._doc;
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      message: messages.MSG5,
    });
  }
};

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
