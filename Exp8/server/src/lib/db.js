import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/classifieds';

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err);
    throw err;
  }
}
