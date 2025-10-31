import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  label: String,
  line1: String,
  line2: String,
  city: String,
  state: String,
  postalCode: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'restaurant'], default: 'user' },
  addresses: [addressSchema],
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
