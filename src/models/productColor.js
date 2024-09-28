import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  color_name: {
    type: String,
    required: true,
  },
});

export default mongoose.model("product_colors", userSchema);
