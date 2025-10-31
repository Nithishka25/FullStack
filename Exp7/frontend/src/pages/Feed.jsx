import { useEffect, useState } from 'react';
import api from '../api/client.js';
import PostComposer from '../components/PostComposer.jsx';
import PostItem from '../components/PostItem.jsx';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [followingSet, setFollowingSet] = useState(new Set());
  const me = JSON.parse(localStorage.getItem('user') || 'null');
  const [showComposer, setShowComposer] = useState(false);

  async function fetchFirstPage() {
    setLoading(true);
    try {
      const { data } = await api.get('/posts/feed', { params: { page: 1 } });
      setPosts(data.items || []);
      setHasMore((data.items || []).length > 0 && (data.total || 0) > (data.limit || 20));
      setPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFirstPage();
    (async () => {
      try {
        if (me?.username) {
          const { data } = await api.get(`/users/${me.username}/following`);
          setFollowingSet(new Set((data || []).map((u) => u.username)));
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  function onPosted(newPost) {
    setPosts((prev) => [newPost, ...prev]);
    setShowComposer(false);
  }

  function onUpdated(updated) {
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  }
  function onDeleted(id) {
    setPosts((prev) => prev.filter((p) => p._id !== id));
  }

  async function loadMore() {
    const next = page + 1;
    try {
      const { data } = await api.get('/posts/feed', { params: { page: next } });
      const items = data.items || [];
      setPosts((prev) => [...prev, ...items]);
      setPage(next);
      if (items.length === 0 || prevReachedTotal(next, data.total, data.limit)) setHasMore(false);
    } catch (err) {
      console.error(err);
    }
  }

  function prevReachedTotal(nextPage, total, limit = 20) {
    const countAfterLoad = nextPage * limit;
    return total !== undefined && countAfterLoad >= total;
  }

  async function toggleFollow(username) {
    try {
      if (followingSet.has(username)) {
        await api.post(`/users/${username}/unfollow`);
        setFollowingSet((prev) => {
          const next = new Set(prev);
          next.delete(username);
          return next;
        });
      } else {
        await api.post(`/users/${username}/follow`);
        setFollowingSet((prev) => new Set(prev).add(username));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="grid">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Your feed</div>
          <button className="button secondary" onClick={fetchFirstPage} disabled={loading}>Refresh</button>
        </div>
        <div className="card" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 12 }}>Loading...</div>
          ) : posts.length === 0 ? (
            <div style={{ padding: 12 }}>No posts yet</div>
          ) : (
            posts.map((p) => (
              <PostItem
                key={p._id}
                post={p}
                onUpdated={onUpdated}
                onDeleted={onDeleted}
                showFollow={me?.username && p.author?.username && me.username !== p.author.username}
                isFollowing={p.author?.username ? followingSet.has(p.author.username) : false}
                onToggleFollow={() => p.author?.username && toggleFollow(p.author.username)}
              />
            ))
          )}
        </div>
        {!loading && hasMore && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <button className="button" onClick={loadMore}>Load more</button>
          </div>
        )}
      </div>
      <div>
        <div className="card">Welcome to your feed.</div>
      </div>
      {/* Floating compose button */}
      <button
        aria-label="Compose"
        title="Compose"
        onClick={() => setShowComposer(true)}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          background: 'var(--primary)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          fontSize: 28,
          lineHeight: '56px',
          textAlign: 'center',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        +
      </button>

      {/* Modal composer */}
      {showComposer && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001
          }}
          onClick={() => setShowComposer(false)}
        >
          <div style={{ width: 'min(640px, 92vw)' }} onClick={(e) => e.stopPropagation()}>
            <PostComposer onPosted={onPosted} onClose={() => setShowComposer(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
