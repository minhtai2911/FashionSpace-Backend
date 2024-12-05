import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
    default: null,
  },
  content: {
    type: String,
    default: null,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("ReviewResponse", userSchema);
