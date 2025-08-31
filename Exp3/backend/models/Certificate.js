import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuer: String,
  date: String,
  image: String
});

export default mongoose.model("Certificate", certificateSchema);
