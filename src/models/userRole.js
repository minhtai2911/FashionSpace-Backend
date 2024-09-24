import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  role_name : {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  }
});

export default mongoose.model("user_roles", userSchema);
