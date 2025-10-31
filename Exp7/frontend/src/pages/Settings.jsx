import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function Settings() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const me = JSON.parse(localStorage.getItem('user') || 'null');
    if (me?.username) {
      api.get(`/users/${me.username}`).then(({ data }) => {
        setName(data.name || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatarUrl || '');
        setIsPrivate(!!data.isPrivate);
      });
    }
  }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const { data } = await api.put('/users/me', { name, bio, avatarUrl });
      localStorage.setItem('user', JSON.stringify({
        ...(JSON.parse(localStorage.getItem('user') || '{}')),
        name: data.name,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
      }));
      setMsg('Saved');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    if (!confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) return;
    try {
      setDeleting(true);
      await api.delete('/users/me');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/register';
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h2>Settings</h2>
      <div className="card">
        <form onSubmit={save}>
          <label>Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          <div style={{ height: 10 }} />
          <label>Bio</label>
          <textarea rows={3} className="input" value={bio} onChange={(e) => setBio(e.target.value)} />
          <div style={{ height: 10 }} />
          <label>Avatar URL</label>
          <input className="input" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
          <div style={{ height: 10 }} />
          <button className="button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          {msg && <div style={{ marginTop: 8, color: '#9ca3af' }}>{msg}</div>}
        </form>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Privacy</div>
        <div className="meta">Current: {isPrivate ? 'Private' : 'Public'}</div>
        <div className="meta" style={{ marginTop: 6 }}>To change privacy, edit your profile from your Profile page (✏️ Edit).</div>
      </div>
      <div className="card" style={{ marginTop: 16, borderColor: 'salmon' }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: 'salmon' }}>Danger zone</div>
        <div className="meta" style={{ marginBottom: 12 }}>Permanently delete your account and all content. This cannot be undone.</div>
        <button className="button secondary" style={{ borderColor: 'salmon', color: 'salmon' }} disabled={deleting} onClick={deleteAccount}>
          {deleting ? 'Deleting...' : 'Delete my account'}
        </button>
      </div>
    </div>
  );
}
