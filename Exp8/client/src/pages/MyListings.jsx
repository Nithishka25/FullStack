import { useEffect, useState } from 'react';
import api from '../api/client';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function MyListings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/products/mine');
      setItems(res.data.items || []);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id, status) {
    try {
      await api.put(`/api/products/${id}`, { status });
      await load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to update status');
    }
  }

  async function remove(id) {
    try {
      await api.delete(`/api/products/${id}`);
      await load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to delete');
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My Listings</h2>
      {items.length === 0 ? (
        <div className="text-sm text-gray-600">You have no listings yet. <Button className="ml-2" onClick={() => navigate('/products/new')}>Post an Ad</Button></div>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 flex items-center gap-3">
              {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="w-16 h-16 object-cover rounded-md border" />}
              <div className="flex-1">
                <Link to={`/products/${p._id}`} className="font-medium hover:underline">{p.title}</Link>
                <div className="text-sm text-gray-600 dark:text-gray-400">₹{p.price} • {p.status || 'available'}</div>
              </div>
              <div className="flex items-center gap-2">
                {p.status !== 'sold' ? (
                  <Button className="bg-red-600 hover:bg-red-700" onClick={() => updateStatus(p._id, 'sold')}>Mark Sold</Button>
                ) : (
                  <Button onClick={() => updateStatus(p._id, 'available')}>Mark Available</Button>
                )}
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate(`/products/${p._id}/edit`)}>Edit</Button>
                <Button className="bg-gray-700 hover:bg-gray-800 text-white" onClick={() => navigate(`/products/${p._id}`)}>View</Button>
                <Button className="bg-gray-500 hover:bg-gray-600" onClick={() => remove(p._id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
