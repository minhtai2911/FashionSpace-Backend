import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  roleName : {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  }
});

export default mongoose.model("UserRole", userSchema);
