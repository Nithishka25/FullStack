import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';

export default function Todo() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [q, setQ] = useState('');

  const loadTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/tasks', { params: { status: filter, q } });
      setTasks(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, q]);

  const onAddOrUpdate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        const { data } = await api.put(`/tasks/${editingId}`, { title: title.trim(), description });
        setTasks((prev) => prev.map((t) => (t._id === editingId ? data : t)));
        setEditingId(null);
      } else {
        const { data } = await api.post('/tasks', { title: title.trim(), description });
        setTasks((prev) => [data, ...prev]);
      }
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save task');
    }
  };

  const onEdit = (task) => {
    setEditingId(task._id);
    setTitle(task.title);
    setDescription(task.description || '');
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
  };

  const onToggle = async (task) => {
    try {
      const { data } = await api.put(`/tasks/${task._id}`, { completed: !task.completed });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? data : t)));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update task');
    }
  };

  const onDelete = async (task) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete task');
    }
  };

  const counts = useMemo(() => ({
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  }), [tasks]);

  return (
    <div>
      <h2>My Tasks</h2>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <button onClick={() => setFilter('all')} disabled={filter==='all'}>All ({counts.total})</button>
        <button onClick={() => setFilter('active')} disabled={filter==='active'}>Active ({counts.active})</button>
        <button onClick={() => setFilter('completed')} disabled={filter==='completed'}>Completed ({counts.completed})</button>
        <input
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ marginLeft: 'auto' }}
        />
      </div>

      <form onSubmit={onAddOrUpdate} style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={!title.trim()}>
            {editingId ? 'Update Task' : 'Add Task'}
          </button>
          {editingId && (
            <button type="button" onClick={onCancelEdit}>Cancel</button>
          )}
        </div>
      </form>

      {error && <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <div>Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div>No tasks found.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
          {tasks.map((t) => (
            <li key={t._id} style={{ border: '1px solid #eee', borderRadius: 6, padding: 12, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <input type="checkbox" checked={t.completed} onChange={() => onToggle(t)} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, textDecoration: t.completed ? 'line-through' : 'none' }}>{t.title}</div>
                {t.description && <div style={{ color: '#555', marginTop: 4, whiteSpace: 'pre-wrap' }}>{t.description}</div>}
                <div style={{ color: '#888', marginTop: 6, fontSize: 12 }}>Created {new Date(t.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => onEdit(t)}>Edit</button>
                <button onClick={() => onDelete(t)} style={{ color: 'crimson' }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
