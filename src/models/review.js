import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "products",
  },
  rating: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
  }
});

export default mongoose.model("reviews", userSchema);
