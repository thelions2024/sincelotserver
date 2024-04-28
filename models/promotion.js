import mongoose from "mongoose";

const schema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, "Please Add Promotion Image"]
  },
  visibility: {
    type: Boolean,
    default: true,
  },
});

export const Promotion = mongoose.model("Promotion", schema);
