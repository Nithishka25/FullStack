import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: 'text' },
    description: { type: String, index: 'text' },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    category: { type: String, index: true },
    location: { type: String, index: true },
    status: { type: String, enum: ['available', 'sold'], default: 'available', index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text' });

export const Product = mongoose.model('Product', productSchema);
