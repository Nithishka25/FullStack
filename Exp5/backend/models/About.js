import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  degree: String,
  institution: String,
  year: String,
  description: String
}, { _id: false });

const experienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  duration: String,
  description: String
}, { _id: false });

const achievementSchema = new mongoose.Schema({
  title: String,
  description: String,
  year: String
}, { _id: false });

const aboutSchema = new mongoose.Schema({
  bio: String,
  image: String,
  education: [educationSchema],
  experience: [experienceSchema],
  achievements: [achievementSchema]
}, { timestamps: true });

export default mongoose.model('About', aboutSchema);
