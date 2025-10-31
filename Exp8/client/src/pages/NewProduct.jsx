import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';

export default function NewProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', price: '', images: '', category: '', location: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [filePreviews, setFilePreviews] = useState([]); // data URLs for selected images

  const fileInputRef = useRef(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // If files selected, use their data URLs; otherwise parse comma-separated URLs
      const imagesArr = filePreviews.length > 0
        ? filePreviews
        : (form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : []);

      const payload = {
        ...form,
        price: Number(form.price),
        images: imagesArr,
      };
      const res = await api.post('/api/products', payload);
      navigate(`/products/${res.data.product._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Post an Ad</h2>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <Input name="title" value={form.title} onChange={onChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <Textarea name="description" value={form.description} onChange={onChange} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
            <Input name="price" type="number" value={form.price} onChange={onChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <Input name="category" value={form.category} onChange={onChange} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <Input name="location" value={form.location} onChange={onChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
              <span>Images</span>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-md border border-gray-300 hover:border-brand">
                <span aria-hidden>📎</span>
                <span>Attach</span>
              </button>
            </label>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                const readers = files.map(file => new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result);
                  reader.readAsDataURL(file);
                }));
                Promise.all(readers).then((urls) => setFilePreviews(urls));
              }}
            />
            {/* Fallback manual URLs input */}
            <Input placeholder="Or paste image URLs, comma-separated" name="images" value={form.images} onChange={onChange} className="mt-2" />
            {filePreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {filePreviews.map((src, idx) => (
                  <img key={idx} src={src} alt={`preview-${idx}`} className="w-full h-24 object-cover rounded-md border" />
                ))}
              </div>
            )}
          </div>
        </div>
        <button type="submit" disabled={loading} className="rounded-md bg-brand text-white px-4 py-2 hover:bg-brand-dark disabled:opacity-50">
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}
