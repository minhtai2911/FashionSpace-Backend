import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  commune: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

export default mongoose.model("OrderAddress", userSchema);
