import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
    unique: true,
  }
});

export default mongoose.model("ProductColor", userSchema);
