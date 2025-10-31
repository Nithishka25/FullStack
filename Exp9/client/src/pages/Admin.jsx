import React, { useEffect, useState } from 'react';
import api from '../api.js';

export default function Admin() {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [form, setForm] = useState({ text: '', type: 'text', options: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'questions' | 'responses'
  const [expandedRespId, setExpandedRespId] = useState(null);

  const load = async () => {
    try {
      const [qRes, rRes] = await Promise.all([
        api.get('/api/questions'),
        api.get('/api/responses'),
      ]);
      setQuestions(qRes.data);
      setResponses(rRes.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load admin data');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upsert = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        text: form.text,
        type: form.type,
        options: form.type === 'text' ? [] : form.options.split('\n').map((s) => s.trim()).filter(Boolean),
        isActive: true,
      };
      if (editingId) {
        await api.put(`/api/questions/${editingId}`, payload);
      } else {
        await api.post('/api/questions', payload);
      }
      setForm({ text: '', type: 'text', options: '' });
      setEditingId(null);
      await load();
      setActiveTab('questions');
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed');
    }
  };

  const edit = (q) => {
    setEditingId(q._id);
    setForm({
      text: q.text,
      type: q.type,
      options: (q.options || []).join('\n'),
    });
    setActiveTab('questions');
  };

  const removeQ = async (id) => {
    if (!confirm('Delete this question?')) return;
    try {
      await api.delete(`/api/questions/${id}`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="grid" style={{ gap: 20 }}>
      <h2>Admin Panel</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div className="tabs">
        <button className={`tab-btn ${activeTab==='home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>Home</button>
        <button className={`tab-btn ${activeTab==='questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')}>Questions</button>
        <button className={`tab-btn ${activeTab==='responses' ? 'active' : ''}`} onClick={() => setActiveTab('responses')}>Responses</button>
      </div>

      {activeTab === 'home' && (
        <div className="grid cols-3">
          <div className="card">
            <div className="section-title">Questions</div>
            <div className="muted small">Total</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{questions.length}</div>
          </div>
          <div className="card">
            <div className="section-title">Responses</div>
            <div className="muted small">Total</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{responses.length}</div>
          </div>
          <div className="card">
            <div className="section-title">Recent</div>
            <div className="muted small">Last submission</div>
            <div>{responses[0] ? new Date(responses[0].createdAt).toLocaleString() : '—'}</div>
          </div>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="grid cols-2">
          <div className="card">
            <h3 className="section-title">{editingId ? 'Edit Question' : 'Add Question'}</h3>
            <form onSubmit={upsert} className="grid" style={{ gap: 12 }}>
              <label className="label">Question Text</label>
              <input className="input" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="text">Text</option>
                <option value="single">Single Choice</option>
                <option value="multi">Multiple Choice</option>
              </select>
              {form.type !== 'text' && (
                <>
                  <label className="label">Options (one per line)</label>
                  <textarea className="input" rows={6} value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} />
                </>
              )}
              <div className="actions">
                <button type="submit" className="button">{editingId ? 'Update' : 'Create'}</button>
                {editingId && (
                  <button type="button" className="button secondary" onClick={() => { setEditingId(null); setForm({ text: '', type: 'text', options: '' }); }}>Cancel</button>
                )}
              </div>
            </form>
          </div>
          <div className="card">
            <h3 className="section-title">Questions</h3>
            {questions.length === 0 && <div className="muted">No questions yet.</div>}
            <ul className="list">
              {questions.map((q) => (
                <li key={q._id}>
                  <div style={{ fontWeight: 'bold' }}>{q.text} <small className="muted">({q.type})</small></div>
                  {q.options?.length ? (
                    <div className="muted small">Options: {q.options.join(', ')}</div>
                  ) : null}
                  <div className="actions">
                    <button className="button inline secondary" onClick={() => edit(q)}>Edit</button>
                    <button className="button inline danger" onClick={() => removeQ(q._id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'responses' && (
        <div className="card">
          <h3 className="section-title">Responses</h3>
          {responses.length === 0 && <div className="muted">No responses yet.</div>}
          <ul className="list">
            {responses.map((r) => {
              const isOpen = expandedRespId === r._id;
              return (
                <li key={r._id}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div><strong>{r.user?.email || 'Unknown user'}</strong></div>
                      <div className="muted small">{new Date(r.createdAt).toLocaleString()}</div>
                    </div>
                    <button className="button inline" onClick={() => setExpandedRespId(isOpen ? null : r._id)}>
                      {isOpen ? 'Hide' : 'View'}
                    </button>
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: 8 }}>
                      {(r.answers || []).map((a, idx) => (
                        <div key={idx}>
                          <strong>{a.question?.text}:</strong> {Array.isArray(a.answer) ? a.answer.join(', ') : String(a.answer)}
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
