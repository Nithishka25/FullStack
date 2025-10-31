import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import Input from '../components/ui/Input';

export default function Register() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/register', form);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Register</h2>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <Input name="name" value={form.name} onChange={onChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <Input name="email" type="email" value={form.email} onChange={onChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <Input name="password" type="password" value={form.password} onChange={onChange} required />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-md bg-brand text-white py-2 hover:bg-brand-dark disabled:opacity-50">
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">Already have an account? <Link to="/login" className="text-brand hover:underline">Login</Link></p>
    </div>
  );
}
