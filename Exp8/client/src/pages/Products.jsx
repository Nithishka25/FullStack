import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Products() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  async function fetchProducts(p = 1) {
    const params = { page: p, limit };
    if (q) params.q = q;
    if (category) params.category = category;
    if (location) params.location = location;
    const res = await api.get('/api/products', { params });
    setItems(res.data.items);
    setTotal(res.data.total);
    setPage(res.data.page);
  }

  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pages = Math.ceil(total / limit) || 1;

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Listings</h2>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
        <Input className="flex-1" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <Input className="flex-1" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <Input className="flex-1" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Button onClick={() => fetchProducts(1)}>Search</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from({ length: pages }).map((_, i) => (
          <button key={i} onClick={() => fetchProducts(i + 1)} disabled={page === i + 1} className={`px-3 py-1.5 rounded-md border ${page === i + 1 ? 'bg-brand text-white border-brand' : 'border-gray-300 hover:border-brand'}`}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
