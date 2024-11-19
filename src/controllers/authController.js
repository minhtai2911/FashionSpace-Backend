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
    res.status(500).json({ message: err.message });
  }
});

const login = asyncHandler(async (req, res, next) => {
  try {
    const email = req.body.email;
    const originalPassword = req.body.password;

    if (!email || !originalPassword) {
      throw new Error("Please fill in the email and password");
    }

    const user = await User.login(email, originalPassword);

    if (!user.isActive) {
      return res.status(400).json({ data: user });
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

    return res.status(200).json({ ...data, accessToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const signup = asyncHandler(async (req, res, next) => {
  const { email, fullName, phone, password } = req.body;

  if (!email || !fullName || !phone || !password) {
    throw new Error("Please fill in all required fields");
  }
  const exists = await User.findOne({ email: email });

  if (exists) return res.status(409).json({ message: "Email already exists" });

  const role = await UserRole.findOne({ roleName: "Customer" });
  const roleId = role._id;
  const user = new User({ email, fullName, phone, roleId, password });
  try {
    await user.save();
    const { password, ...data } = user._doc;
    res.status(201).json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
      subject: "VERIFY REGISTRATION FASHION SPACE ACCOUNT",
      html: `
      <a href="${process.env.URL_CLIENT}/verify/${req.body.id}">Click here to verify your email</a>
      `,
    });
    res.status(200).json({ message: "Verification email sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const verifyAccount = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

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
      message: "Account verified successfully",
      data: { ...data, accessToken },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.status(200).json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const refreshToken = asyncHandler(async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
      if (err) {
        return res.status(403).json({ message: "Invalid refresh token!" });
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
    res.status(500).json({ message: err.message });
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
      subject: "RESET PASSWORD FROM FASHION SPACE",
      html: `
      <div>Hi ${email},</div>
      <div>We received a request to reset your password</div>
      <div>Your OTP: <br>${OTP}</br></div>
      `,
    });
    res.status(200).json({
      message: "Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

const checkOTPByEmail = asyncHandler(async (req, res, next) => {
  try {
    const otp = req.body.OTP;
    const email = req.body.email;
    const otpList = await Otp.find({ email: email });

    if (otpList.length < 1) {
      return res.status(400).json({ message: "OTP not found" });
    }

    const check = await bcrypt.compare(otp, otpList[otpList.length - 1].otp);

    if (!check) {
      return res.status(400).json({ message: "Invalid OTP" });
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
      .json({ message: "OTP verified", data: { ...data, accessToken } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

const checkEmail = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    res.status(200).json({ message: "Email available" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.password = req.body.newPassword;
    await user.save();
    res.status(200).json({ message: "Reset password successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const check = await bcrypt.compare(req.body.password, user.password);

    if (!check) return res.status(400).json({ message: "Invalid password" });

    user.password = req.body.newPassword;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const loginGoogleSuccess = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const check = await bcrypt.compare(user._id.toString(), req.body.token);

    if (!check) return res.status(403).json({ message: "Token is not valid" });

    const { password, ...data } = user._doc;
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
