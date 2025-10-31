import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    amount: { type: Number, required: true }, // in cents
    currency: { type: String, default: 'usd' },
    status: { type: String, enum: ['paid', 'failed', 'pending'], default: 'paid' },
    paymentIntentId: { type: String },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', OrderSchema);
