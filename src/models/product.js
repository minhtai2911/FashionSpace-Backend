import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Category",
  },
  price: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    default: null,
  },
});

export default mongoose.model("Product", userSchema);
