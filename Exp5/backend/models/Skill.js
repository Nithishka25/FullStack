import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, default: 50 }, // 0-100
  category: { type: String, default: 'technical' },
  icon: { type: String, default: '' },
  description: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Skill', skillSchema);