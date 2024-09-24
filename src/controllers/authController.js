import User from "../models/user.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../middleware/asyncHandler.js";

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
      expiresIn: "3d",
    }
  );

  const { password, ...data } = user._doc;

  return res.status(200).json({ ...data, accessToken });
});

const signup = asyncHandler(async (req, res, next) => {
  const { email, full_name, phone, role_id, password } = req.body;

  // if (!email || !full_name || !phone || !role_id || !password) {
  //   throw new Error("Please fill in all required fields");
  // }

  const exists = await User.findOne({ email: email });

  if (exists) return res.status(400).json({ message: "Email already exists" });

  const user = new User({ email, full_name, phone, role_id, password });
  
  try {
    await user.save();
  } catch (err) {
    res.status(400);
    throw new Error("Invalid user data");
  }

  const accessToken = jwt.sign(
    { id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "3d",
    }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
  );

  await User.findByIdAndUpdate(user._id, {
    $set: { refreshToken: refreshToken },
  });

  user.refreshToken = refreshToken;

  return res.status(201).json({ ...user._doc, accessToken });
});

const logout = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.body._id, {
    $set: { refreshToken: "" },
  });
  res.status(200).json({ message: "Logged out" });
});

const refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.body.refreshToken;
  const email = req.body.email;
  const password = req.body.password;

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized!" });
  }

  const user = await User.login(email, password);

  if (!refreshToken.includes(user.refreshToken)) {
    return res.status(403).json({ message: "Invalid refresh token!" });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
    if (err) {
      return res.status(403).json({ message: "Invalid refresh token!" });
    }
    const accessToken = jwt.sign(
      { id: data._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "3d",
      }
    );
    return res.json(accessToken);
  });
});

export default {
  login: login,
  signup: signup,
  logout: logout,
  refreshToken: refreshToken,
};
