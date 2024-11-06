import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  imagePath: {
    type: String,
    required: true,
  }
});

export default mongoose.model("ProductImage", userSchema);
