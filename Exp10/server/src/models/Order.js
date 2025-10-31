import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: String,
  price: Number,
  quantity: Number
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [orderItemSchema],
  total: Number,
  address: {
    line1: String, line2: String, city: String, state: String, postalCode: String
  },
  status: { type: String, enum: ['placed','accepted','preparing','out_for_delivery','delivered','cancelled'], default: 'placed' }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
