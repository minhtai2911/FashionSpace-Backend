import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import { messages } from "../config/messageHelper.js";

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
    },
    googleId: {
      type: String,
    },
    avatarPath: {
      type: String,
      default: "",
    },
    publicId: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date, 
    },
  },
  { timestamps: true }
);

userSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

userSchema.pre("save", async function (next) {
  if (this.isGuest === true && !this.expiresAt) {
    const expirationTime = 30; 
    this.expiresAt = Date.now() + expirationTime * 24 * 60 * 60 * 1000;  
  }
  if (this.password) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.statics.login = async function (email, password) {
  try {
    const user = await this.findOne({ email });
    if (!user) {
      throw new Error(messages.MSG2);
    }

    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      throw new Error(messages.MSG2);
    }
    
    return user;
  } catch (err) {
    throw new Error(messages.MSG2);
  }
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
