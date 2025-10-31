import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import PostItem from '../components/PostItem.jsx';

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const me = JSON.parse(localStorage.getItem('user') || 'null');
  const isMe = me && me.username === username;
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('following'); // 'following' | 'followers'
  const [listFollowing, setListFollowing] = useState([]);
  const [listFollowers, setListFollowers] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [postsCount, setPostsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [status, setStatus] = useState({ isPrivate: false, isFollowing: false, requested: false });
  const [requests, setRequests] = useState([]); // only for me
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', avatarUrl: '', dob: '', contact: '', isPrivate: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: user }, { data: st }] = await Promise.all([
          api.get(`/users/${username}`),
          me?.username ? api.get(`/users/${username}/status`) : Promise.resolve({ data: { isPrivate: false, isFollowing: false, requested: false } })
        ]);
        setProfile(user);
        setStatus(st);
        // Load counts and initial lists conditionally based on privacy
        if (!st.isPrivate || isMe || st.isFollowing) {
          const [{ data: list }, { data: fol }, { data: fers }] = await Promise.all([
            api.get(`/posts/user/${username}`, { params: { page: 1 } }),
            api.get(`/users/${username}/following`),
            api.get(`/users/${username}/followers`)
          ]);
          setPosts(list.items || []);
          setPage(1);
          setHasMore((list.items || []).length > 0 && (list.total || 0) > (list.limit || 20));
          setPostsCount(list.total || (list.items || []).length || 0);
          setFollowingCount((fol || []).length);
          setFollowersCount((fers || []).length);
        } else {
          setPosts([]);
          setHasMore(false);
          setPostsCount(0);
        }
        // Pre-fill edit form for me
        if (isMe) {
          setEditForm({
            name: user.name || '',
            bio: user.bio || '',
            avatarUrl: user.avatarUrl || '',
            dob: user.dob ? new Date(user.dob).toISOString().slice(0, 10) : '',
            contact: user.contact || '',
            isPrivate: !!user.isPrivate,
          });
        }
        if (me && !isMe) {
          // Fetch my following list and see if it contains the profile user
          const res = await api.get(`/users/${me.username}/following`);
          const isFollowing = (res.data || []).some((u) => u.username === username);
          setFollowing(isFollowing);
        }
        // Reset lists & tab on username change
        setActiveTab('following');
        setListFollowers([]);
        setListFollowing([]);
        // If me, load incoming requests
        if (isMe) {
          try {
            const { data } = await api.get('/users/me/requests');
            setRequests(data || []);
          } catch {}
        } else {
          setRequests([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  async function toggleFollow() {
    try {
      if (following) {
        await api.post(`/users/${username}/unfollow`);
        setFollowing(false);
        setStatus((s) => ({ ...s, isFollowing: false }));
      } else {
        const { data } = await api.post(`/users/${username}/follow`);
        if (data?.requested) {
          setStatus((s) => ({ ...s, requested: true }));
        } else {
          setFollowing(true);
          setStatus((s) => ({ ...s, isFollowing: true }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadMore() {
    const next = page + 1;
    try {
      const { data } = await api.get(`/posts/user/${username}`, { params: { page: next } });
      const items = data.items || [];
      setPosts((prev) => [...prev, ...items]);
      setPage(next);
      if (items.length === 0 || reachedTotal(next, data.total, data.limit)) setHasMore(false);
    } catch (err) {
      console.error(err);
    }
  }

  function reachedTotal(nextPage, total, limit = 20) {
    const count = nextPage * limit;
    return total !== undefined && count >= total;
  }

  async function showTab(tab) {
    setActiveTab(tab);
    if (tab === 'following' && listFollowing.length === 0) {
      setListLoading(true);
      try {
        const { data } = await api.get(`/users/${username}/following`);
        setListFollowing(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setListLoading(false);
      }
    }
    if (tab === 'followers' && listFollowers.length === 0) {
      setListLoading(true);
      try {
        const { data } = await api.get(`/users/${username}/followers`);
        setListFollowers(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setListLoading(false);
      }
    }
  }

  async function toggleFollowInline(u) {
    try {
      if (u.username === me?.username) return;
      const isFollowingNow = await (async () => {
        if (listFollowing.find((x) => x.username === u.username)) {
          await api.post(`/users/${u.username}/unfollow`);
          return false;
        } else {
          await api.post(`/users/${u.username}/follow`);
          return true;
        }
      })();
      // Update inline lists
      if (activeTab === 'following') {
        setListFollowing((prev) =>
          isFollowingNow ? [...prev, u] : prev.filter((x) => x.username !== u.username)
        );
      }
      if (activeTab === 'followers') {
        // No structural change for followers list; button label changes based on my following state
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function approveRequest(requester) {
    try {
      await api.post(`/users/${username}/approve`, { requesterId: requester.id || requester._id });
      setRequests((prev) => prev.filter((r) => (r.id || r._id) !== (requester.id || requester._id)));
    } catch (e) { console.error(e); }
  }
  async function denyRequest(requester) {
    try {
      await api.post(`/users/${username}/deny`, { requesterId: requester.id || requester._id });
      setRequests((prev) => prev.filter((r) => (r.id || r._id) !== (requester.id || requester._id)));
    } catch (e) { console.error(e); }
  }

  if (loading) return <div style={{ padding: 12 }}>Loading...</div>;
  if (!profile) return <div style={{ padding: 12 }}>User not found</div>;

  return (
    <div className="grid">
      <div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0 }}>{profile.name}</h2>
              <div className="meta">@{profile.username}</div>
              {profile.bio && <div style={{ marginTop: 8 }}>{profile.bio}</div>}
              {/* counts removed from header; shown in Profile info card */}
              {status.isPrivate && !isMe && !status.isFollowing && (
                <div className="meta" style={{ marginTop: 8 }}> This account is private</div>
              )}
            </div>
            {isMe ? (
              <button className="button" aria-label="Edit profile" title="Edit profile" onClick={() => setEditing(true)}>✏️ Edit</button>
            ) : (
              status.isPrivate ? (
                status.isFollowing ? (
                  <button className="button" onClick={toggleFollow}>Unfollow</button>
                ) : status.requested ? (
                  <button className="button secondary" disabled>Requested</button>
                ) : (
                  <button className="button" onClick={toggleFollow}>Request to follow</button>
                )
              ) : (
                <button className="button" onClick={toggleFollow}>{following ? 'Unfollow' : 'Follow'}</button>
              )
            )}
          </div>
        </div>
        {(!status.isPrivate || isMe || status.isFollowing) ? (
          <>
            <div className="card" style={{ padding: 0, marginTop: 12 }}>
              {posts.length === 0 ? (
                <div style={{ padding: 12 }}>No posts</div>
              ) : (
                posts.map((p) => <PostItem key={p._id} post={p} />)
              )}
            </div>
            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                <button className="button" onClick={loadMore}>Load more</button>
              </div>
            )}
          </>
        ) : (
          <div className="card" style={{ marginTop: 12 }}>
            Only approved followers can view posts.
          </div>
        )}

        {/* lists moved into right Profile info card */}
      </div>
      <div>
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Profile info</div>
          <div className="meta" style={{ marginBottom: 12 }}>@{profile.username}</div>
          {profile.bio && <div style={{ marginBottom: 12 }}>{profile.bio}</div>}
          {(profile.dob || profile.contact) && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
              {profile.dob && <span className="meta">🎂 {new Date(profile.dob).toLocaleDateString()}</span>}
              {profile.contact && <span className="meta">☎️ {profile.contact}</span>}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <span className="meta">📝 {postsCount}</span>
            <span className="meta">➡️ {followingCount}</span>
            <span className="meta">👥 {followersCount}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button className={`button ${activeTab === 'following' ? '' : 'secondary'}`} onClick={() => showTab('following')}>Following</button>
            <button className={`button ${activeTab === 'followers' ? '' : 'secondary'}`} onClick={() => showTab('followers')}>Followers</button>
          </div>
          {/* Followers/Following lists shown here under the buttons */}
          {(!status.isPrivate || isMe || status.isFollowing) ? (
            activeTab === 'following' ? (
              listLoading ? (
                <div>Loading...</div>
              ) : listFollowing.length === 0 ? (
                <div>No following</div>
              ) : (
                listFollowing.map((u) => (
                  <div key={u.username} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>@{u.username}</div>
                      <div className="meta">{u.name}</div>
                    </div>
                    {me?.username !== u.username && (
                      <button className="button" onClick={() => toggleFollowInline(u)}>Unfollow</button>
                    )}
                  </div>
                ))
              )
            ) : activeTab === 'followers' ? (
              listLoading ? (
                <div>Loading...</div>
              ) : listFollowers.length === 0 ? (
                <div>No followers</div>
              ) : (
                listFollowers.map((u) => (
                  <div key={u.username} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>@{u.username}</div>
                      <div className="meta">{u.name}</div>
                    </div>
                    {me?.username !== u.username && (
                      <button className="button" onClick={() => toggleFollowInline(u)}>
                        {listFollowing.find((x) => x.username === u.username) ? 'Unfollow' : 'Follow'}
                      </button>
                    )}
                  </div>
                ))
              )
            ) : null
          ) : (
            <div className="meta">Only approved followers can view lists.</div>
          )}
          {isMe && requests.length > 0 && (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Follow requests</div>
              {requests.map((r) => (
                <div key={r.username} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>@{r.username}</div>
                    <div className="meta">{r.name}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="button" onClick={() => approveRequest(r)}>Approve</button>
                    <button className="button secondary" onClick={() => denyRequest(r)}>Deny</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {editing && (
        <div role="dialog" aria-modal="true" onClick={() => !saving && setEditing(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 'min(640px, 92vw)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Edit profile</div>
            <div style={{ display: 'grid', gap: 8 }}>
              <label>Name</label>
              <input className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              <label>Bio</label>
              <textarea rows={3} className="input" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
              <label>Avatar URL</label>
              <input className="input" value={editForm.avatarUrl} onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })} />
              <label>Date of Birth</label>
              <input className="input" type="date" value={editForm.dob} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} />
              <label>Contact</label>
              <input className="input" value={editForm.contact} onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={editForm.isPrivate} onChange={(e) => setEditForm({ ...editForm, isPrivate: e.target.checked })} />
                Private account (followers must request approval)
              </label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="button" disabled={saving} onClick={async () => {
                  setSaving(true);
                  try {
                    const payload = {
                      name: editForm.name,
                      bio: editForm.bio,
                      avatarUrl: editForm.avatarUrl || undefined,
                      dob: editForm.dob || undefined,
                      contact: editForm.contact || undefined,
                      isPrivate: editForm.isPrivate,
                    };
                    const { data } = await api.put('/users/me', payload);
                    // Update local profile + status + localStorage
                    setProfile((prev) => ({ ...prev, ...data }));
                    setStatus((s) => ({ ...s, isPrivate: !!data.isPrivate }));
                    const userLS = JSON.parse(localStorage.getItem('user') || '{}');
                    localStorage.setItem('user', JSON.stringify({ ...userLS, name: data.name, bio: data.bio, avatarUrl: data.avatarUrl }));
                    setEditing(false);
                  } catch (err) {
                    alert(err.response?.data?.message || 'Failed to save');
                  } finally {
                    setSaving(false);
                  }
                }}>Save</button>
                <button className="button secondary" disabled={saving} onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
