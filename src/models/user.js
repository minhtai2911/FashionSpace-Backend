import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: (value) => {
      return validator.isEmail(value);
    },
  },
  full_name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    validate: (value) => {
      return validator.isMobilePhone(value, "vi-VN");
    },
  },
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "roles",
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  imgURL: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
});

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
    throw new Error("Invalid email or password");
  }
  throw new Error("Invalid email or password");
};

export default mongoose.model("users", userSchema);
