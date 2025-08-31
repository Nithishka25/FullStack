// models/Project.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  techStack: [String],
  link: String,
});

export default mongoose.model("Project", projectSchema);
