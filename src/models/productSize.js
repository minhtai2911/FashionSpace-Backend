import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "ProductCategory",
  },
  size: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.model("ProductSize", userSchema);
