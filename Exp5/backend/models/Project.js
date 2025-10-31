// models/Project.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  technologies: { type: [String], default: [] },
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['completed', 'in-progress', 'planned'], default: 'completed' }
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);
