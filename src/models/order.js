import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users"
  },
  status: {
    type: String,
    required: true,
    // enum: ["pending", "processing", "shipped", "delivered", "cancelled"]
  },
  total: {
    type: Number,
    required: true,
  }
});

export default mongoose.model("orders", userSchema);
