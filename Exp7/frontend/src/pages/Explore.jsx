import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

export default function Explore() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [followingSet, setFollowingSet] = useState(new Set());
  const [requestedSet, setRequestedSet] = useState(new Set());
  const me = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    load(1, true);
    // Load my following list to compute follow state
    (async () => {
      try {
        if (me?.username) {
          const { data } = await api.get(`/users/${me.username}/following`);
          const set = new Set((data || []).map((u) => u.username));
          setFollowingSet(set);
        }
      } catch (err) {
        console.error(err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(nextPage = 1, replace = false) {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: { page: nextPage, search } });
      setUsers((prev) => (replace ? data.items : [...prev, ...data.items]));
      setHasMore((data.items || []).length > 0 && (data.total || 0) > nextPage * (data.limit || 20));
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function onSearch(e) {
    e.preventDefault();
    load(1, true);
  }

  async function toggleFollow(user) {
    try {
      const username = user.username;
      if (followingSet.has(username)) {
        await api.post(`/users/${username}/unfollow`);
        setFollowingSet((prev) => {
          const next = new Set(prev);
          next.delete(username);
          return next;
        });
        setRequestedSet((prev) => {
          const next = new Set(prev);
          next.delete(username);
          return next;
        });
      } else {
        const { data } = await api.post(`/users/${username}/follow`);
        if (user.isPrivate || data?.requested) {
          // request flow
          setRequestedSet((prev) => new Set(prev).add(username));
        } else {
          setFollowingSet((prev) => new Set(prev).add(username));
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h2>Explore</h2>
      <form onSubmit={onSearch} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input className="input" placeholder="Search users by name or username" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="button" type="submit">Search</button>
      </form>
      <div className="card">
        {users.length === 0 && !loading && <div>No users found</div>}
        {users.map((u) => (
          <div key={u.username} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 600 }}>
                <Link to={`/u/${u.username}`}>@{u.username}</Link>
                {u.isPrivate && <span className="meta" style={{ marginLeft: 8 }}>🔒 Private</span>}
              </div>
              <div className="meta">{u.name}</div>
              {u.bio && <div style={{ marginTop: 6 }}>{u.bio}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="meta">Joined {new Date(u.createdAt).toLocaleDateString()}</div>
              {me?.username !== u.username && (
                u.isPrivate ? (
                  followingSet.has(u.username) ? (
                    <button className="button" onClick={() => toggleFollow(u)}>Unfollow</button>
                  ) : requestedSet.has(u.username) ? (
                    <button className="button secondary" disabled>Requested</button>
                  ) : (
                    <button className="button" onClick={() => toggleFollow(u)}>Request</button>
                  )
                ) : (
                  <button className="button" onClick={() => toggleFollow(u)}>
                    {followingSet.has(u.username) ? 'Unfollow' : 'Follow'}
                  </button>
                )
              )}
            </div>
          </div>
        ))}
        {hasMore && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <button className="button" onClick={() => load(page + 1)}>Load more</button>
          </div>
        )}
      </div>
    </div>
  );
}
