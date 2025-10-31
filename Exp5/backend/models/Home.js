import mongoose from 'mongoose';

const homeSchema = new mongoose.Schema({
  name: String,
  title: String,
  intro: String,
  profileImage: String,
  backgroundImage: String,
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
    email: String
  }
}, { timestamps: true });

export default mongoose.model('Home', homeSchema);
