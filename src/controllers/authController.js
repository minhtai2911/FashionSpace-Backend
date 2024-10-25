import User from "../models/user.js";
import User_Role from "../models/userRole.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../middleware/asyncHandler.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import Otp from "../models/otp.js";

const generateOTP = asyncHandler(async (req, res, next) => {
  const otp = Math.floor(100000 + Math.random() * (999999 - 100000)).toString();

  const salt = await bcrypt.genSalt();
  const hashedOTP = await bcrypt.hash(otp, salt);
  const email = req.body.email;

  const otpObj = new Otp({
    email,
    otp: hashedOTP,
  });

  try {
    await otpObj.save();
    res.status(200).json({ otp: otp });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

const login = asyncHandler(async (req, res, next) => {
  const email = req.body.email;
  const originalPassword = req.body.password;

  if (!email || !originalPassword) {
    throw new Error("Please fill in the email and password");
  }

  const user = await User.login(email, originalPassword);

  const accessToken = jwt.sign(
    { id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "30s",
    }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "365d" }
  );

  await User.findByIdAndUpdate(user._id, {
    $set: { refreshToken: refreshToken },
  });

  user.refreshToken = refreshToken;

  const { password, ...data } = user._doc;

  return res.status(200).json({ ...data, accessToken });
});

const signup = asyncHandler(async (req, res, next) => {
  const { email, full_name, phone, password } = req.body;

  if (!email || !full_name || !phone || !password) {
    throw new Error("Please fill in all required fields");
  }
  const exists = await User.findOne({ email: email });

  if (exists) return res.status(400).json({ message: "Email already exists" });

  const role = await User_Role.findOne({ role_name: "User" });
  const role_id = role.id;
  const user = new User({ email, full_name, phone, role_id, password });

  try {
    await user.save();
    const { password, ...data } = user._doc;
    return res.status(201).json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const logout = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, {
    $set: { refreshToken: "" },
  });
  res.status(200).json({ message: "Logged out" });
});

const refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.body.refreshToken;

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
    if (err) {
      return res.status(403).json({ message: "Invalid refresh token!" });
    }
    const accessToken = jwt.sign(
      { id: data._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30s",
      }
    );
    return res.json({ accessToken: accessToken });
  });
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
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      message: "Server error",
    });
  }

  res.status(200).json({
    message: "Successfully",
  });
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

    res.status(200).json({ message: "OTP verified" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

const checkEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ message: "Email not found" });
  }

  res.status(200).json({ message: "Email available" });
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
};
