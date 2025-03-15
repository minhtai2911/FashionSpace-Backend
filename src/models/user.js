import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import path from "path";
import dotenv from "dotenv";
import { messages } from "../config/messageHelper.js";
dotenv.config();

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: (value) => {
        return validator.isEmail(value);
      },
    },
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      validate: (value) => {
        return validator.isMobilePhone(value, "vi-VN");
      },
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "UserRole",
    },
    password: {
      type: String,
      required: true,
    },
    avatarPath: {
      type: String,
      default: `${process.env.URL_SERVER}/avatars/avatar.jpg`,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.password) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw new Error(
      messages.MSG2
    );
  }
  throw new Error(
    messages.MSG2
  );
};

export default mongoose.model("User", userSchema);
