import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "product_categories",
  },
});

export default mongoose.model("product_categories", userSchema);
