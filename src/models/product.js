import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "categories",
  },
  price: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
});

export default mongoose.model("products", userSchema);
