import { useEffect, useState } from 'react';
import api from '../api/client';
import { Link } from 'react-router-dom';

export default function Orders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/api/orders');
        setItems(res.data.orders || []);
      } catch (e) {
        setError(e.response?.data?.error || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My Orders</h2>
      {items.length === 0 ? (
        <div className="text-sm text-gray-600">No orders yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((o) => (
            <div key={o._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 flex items-center gap-3">
              {o.product?.images?.[0] && (
                <img src={o.product.images[0]} alt={o.product.title} className="w-16 h-16 object-cover rounded-md border" />
              )}
              <div className="flex-1">
                <Link to={`/products/${o.product?._id}`} className="font-medium hover:underline">
                  {o.product?.title || 'Product'}
                </Link>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Paid ${(o.amount / 100).toFixed(2)} {o.currency?.toUpperCase()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
