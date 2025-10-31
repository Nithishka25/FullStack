import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  cuisines: [String],
  address: String,
  imageUrl: String,
  isOpen: { type: Boolean, default: true },
  deliveryFee: { type: Number, default: 0 },
  minOrder: { type: Number, default: 0 },
  rating: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Restaurant', restaurantSchema);
