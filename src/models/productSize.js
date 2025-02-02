import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProductSize", userSchema);
