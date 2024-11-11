import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    default: null,
  }
});

export default mongoose.model("ProductCategory", userSchema);
