import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "products",
  },
  image_path: {
    type: String,
    required: true,
  }
});

export default mongoose.model("product_images", userSchema);
