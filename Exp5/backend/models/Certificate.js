import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuer: { type: String, default: '' },
  date: { type: String, default: '' },
  image: { type: String, default: '' },
  credentialUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  skills: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model("Certificate", certificateSchema);
