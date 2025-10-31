import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', { username, email, name, password, isPrivate });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/feed');
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors?.length) {
        setError(res.errors.map((e) => e.msg).join(', '));
      } else if (res?.message) {
        setError(res.message);
      } else {
        setError('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <h2>Register</h2>
      <div className="card">
        <form onSubmit={submit}>
          <input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <div style={{ height: 10 }} />
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div style={{ height: 10 }} />
          <input className="input" placeholder="Display Name" value={name} onChange={(e) => setName(e.target.value)} />
          <div style={{ height: 10 }} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div style={{ height: 10 }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
            Private account (followers must request approval)
          </label>
          <div className="meta" style={{ marginTop: 6 }}>
            {isPrivate ? 'Only approved followers can see your posts and lists.' : 'Anyone can follow you and see your posts.'}
          </div>
          <div style={{ height: 10 }} />
          <button className="button" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
          {error && <div style={{ color: 'salmon', marginTop: 8 }}>{error}</div>}
        </form>
      </div>
      <div style={{ marginTop: 8 }}>Have an account? <Link to="/login">Login</Link></div>
    </div>
  );
}
