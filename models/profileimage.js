import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    filename: String,
    path: String,
    contentType: String
  });

export const ImageModel = mongoose.model("Image",imageSchema);