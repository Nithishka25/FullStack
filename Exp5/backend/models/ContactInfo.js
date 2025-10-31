import mongoose from 'mongoose';

const contactInfoSchema = new mongoose.Schema({
  email: String,
  phone: String,
  location: String,
  availability: String,
  contactMessage: String,
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
    instagram: String,
    website: String
  }
}, { timestamps: true });

export default mongoose.model('ContactInfo', contactInfoSchema);
