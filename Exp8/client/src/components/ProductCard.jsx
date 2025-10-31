import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product._id}`} className="relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition">
      <div className={`relative ${product.status === 'sold' ? 'grayscale' : ''}`}>
        {product.images?.[0] && (
          <img src={product.images[0]} alt={product.title} className="w-full h-40 object-cover" />
        )}
        {product.status === 'sold' && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">SOLD</div>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-medium line-clamp-1">{product.title}</h4>
        <div className="text-brand font-semibold">₹{product.price}</div>
        <div className="text-xs text-gray-500">{product.category} {product.location ? `• ${product.location}` : ''}</div>
      </div>
    </Link>
  );
}
