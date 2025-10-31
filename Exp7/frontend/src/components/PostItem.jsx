import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { Link } from 'react-router-dom';

export default function PostItem({ post, onUpdated, onDeleted, showFollow, isFollowing, onToggleFollow }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isOwner = user && post.author && (post.author._id === user.id || post.author.id === user.id || post.author === user.id);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(post.content);
  const [likesCount, setLikesCount] = useState(Array.isArray(post.likes) ? post.likes.length : (post.likes || 0));
  const [liked, setLiked] = useState(
    Array.isArray(post.likes) ? post.likes.some((id) => id === user?.id) : false
  );
  const [likeBusy, setLikeBusy] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState(Array.isArray(post.comments) ? post.comments : []);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);
  const [likersOpen, setLikersOpen] = useState(false);
  const [likers, setLikers] = useState([]);
  const [likersLoading, setLikersLoading] = useState(false);

  async function save() {
    const { data } = await api.put(`/posts/${post._id}`, { content });
    setEditing(false);
    onUpdated?.(data);
  }

  async function openLikers() {
    if (!isOwner) return;
    setLikersOpen(true);
    try {
      setLikersLoading(true);
      const { data } = await api.get(`/posts/${post._id}/likers`);
      setLikers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLikersLoading(false);
    }
  }

  async function loadComments() {
    if (!commentsOpen) return;
    // If we already have some comments loaded, skip reloading immediately
    if (comments.length > 0) return;
    try {
      setCommentsLoading(true);
      const { data } = await api.get(`/posts/${post._id}/comments`);
      setComments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsOpen]);

  async function submitComment(e) {
    e?.preventDefault?.();
    if (!newComment.trim()) return;
    try {
      setCommentBusy(true);
      const { data } = await api.post(`/posts/${post._id}/comments`, { content: newComment.trim() });
      // Update local comments list from response or append last comment
      if (Array.isArray(data.comments)) {
        setComments(data.comments);
      } else {
        setComments((prev) => [...prev, { content: newComment.trim(), author: { username: user?.username, name: user?.name }, createdAt: new Date().toISOString() }]);
      }
      setNewComment('');
      onUpdated?.(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCommentBusy(false);
    }
  }

  async function remove() {
    await api.delete(`/posts/${post._id}`);
    onDeleted?.(post._id);
  }

  async function toggleLike() {
    if (!user) return;
    try {
      setLikeBusy(true);
      if (liked) {
        setLiked(false);
        setLikesCount((c) => Math.max(0, c - 1));
        const { data } = await api.post(`/posts/${post._id}/unlike`);
        onUpdated?.(data);
      } else {
        setLiked(true);
        setLikesCount((c) => c + 1);
        const { data } = await api.post(`/posts/${post._id}/like`);
        onUpdated?.(data);
      }
    } catch (err) {
      // revert on error
      setLiked((v) => !v);
      setLikesCount((c) => (liked ? c + 1 : Math.max(0, c - 1)));
      console.error(err);
    } finally {
      setLikeBusy(false);
    }
  }

  return (
    <div className="post">
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontWeight: 600 }}>
              <Link to={`/u/${post.author?.username}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {post.author?.name} <span className="meta">@{post.author?.username}</span>
              </Link>
            </div>
      {likersOpen && (
        <div role="dialog" aria-modal="true" onClick={() => setLikersOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 'min(480px, 92vw)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 600 }}>Liked by</div>
              <button className="button secondary" onClick={() => setLikersOpen(false)}>Close</button>
            </div>
            <div style={{ marginTop: 8 }}>
              {likersLoading ? (
                <div className="meta">Loading...</div>
              ) : likers.length === 0 ? (
                <div className="meta">No likes yet</div>
              ) : (
                likers.map((u) => (
                  <div key={u.username} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>@{u.username}</div>
                      <div className="meta">{u.name}</div>
                    </div>
                    <Link className="button secondary" to={`/u/${u.username}`}>View</Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
            {showFollow && (
              <button className="button secondary" onClick={onToggleFollow}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
          <div className="meta">{new Date(post.createdAt).toLocaleString()}</div>
        </div>
        {editing ? (
          <div style={{ marginTop: 8 }}>
            <textarea className="input" rows={3} value={content} onChange={(e) => setContent(e.target.value)} />
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button className="button" onClick={save}>Save</button>
              <button className="button secondary" onClick={() => { setEditing(false); setContent(post.content); }}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {post.content && <div style={{ marginTop: 6 }}>{post.content}</div>}
            {post.imageUrl && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={post.imageUrl}
                  alt="post"
                  style={{
                    width: '100%',
                    maxHeight: 480,
                    objectFit: 'cover',
                    borderRadius: 12,
                    border: '1px solid var(--border)'
                  }}
                />
              </div>
            )}
          </>
        )}
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="button secondary"
            aria-label={liked ? 'Unlike post' : 'Like post'}
            title={liked ? 'Unlike' : 'Like'}
            disabled={likeBusy}
            onClick={toggleLike}
          >
            <span style={{ fontSize: 16, marginRight: 6 }}>{liked ? '❤️' : '🤍'}</span>
            {likesCount}
          </button>
          {isOwner && likesCount > 0 && (
            <button className="button secondary" title="View likers" onClick={openLikers}>View likers</button>
          )}
          <button
            className="button secondary"
            aria-expanded={commentsOpen}
            onClick={() => setCommentsOpen((v) => !v)}
            title="Show comments"
          >
            💬 {Array.isArray(post.comments) ? post.comments.length : (comments?.length || 0)}
          </button>
          {isOwner && !editing && (
            <>
              <button className="button" onClick={() => setEditing(true)}>Edit</button>
              <button className="button secondary" onClick={remove}>Delete</button>
            </>
          )}
        </div>

        {commentsOpen && (
          <div style={{ marginTop: 10 }}>
            <div className="card" style={{ padding: 10 }}>
              {commentsLoading ? (
                <div className="meta">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="meta">No comments yet</div>
              ) : (
                comments.map((c, idx) => (
                  <div key={idx} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600 }}>
                      {c.author?.name || c.author?.username || 'User'} <span className="meta">@{c.author?.username || ''}</span>
                    </div>
                    <div style={{ marginTop: 4 }}>{c.content}</div>
                  </div>
                ))
              )}
              <form onSubmit={submitComment} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  className="input"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button className="button" type="submit" disabled={commentBusy || !newComment.trim()}>
                  {commentBusy ? 'Posting...' : 'Post'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
