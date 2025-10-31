import { useState } from 'react';
import api from '../api/client.js';

export default function PostComposer({ onPosted, onClose }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadBusy, setUploadBusy] = useState(false);
  const [previewSrc, setPreviewSrc] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  async function submit(e) {
    e.preventDefault();
    if (!content.trim() && !imageUrl.trim()) {
      setError('Add some text or an image URL.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = { content: content.trim() || undefined, imageUrl: imageUrl.trim() || undefined };
      const { data } = await api.post('/posts', payload);
      setContent('');
      setImageUrl('');
      if (previewSrc) {
        try { URL.revokeObjectURL(previewSrc); } catch {}
        setPreviewSrc('');
      }
      onPosted?.(data);
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post');
    } finally {
      setLoading(false);
    }
  }

  async function onPickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      setUploadBusy(true);
      // show instant local preview
      const localUrl = URL.createObjectURL(file);
      if (previewSrc) {
        try { URL.revokeObjectURL(previewSrc); } catch {}
      }
      setPreviewSrc(localUrl);
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/posts/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setUploadPct(pct);
        }
      });
      if (data?.url) {
        setImageUrl(data.url);
        // swap preview to server URL and revoke local blob URL
        try { URL.revokeObjectURL(localUrl); } catch {}
        setPreviewSrc(data.url);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadBusy(false);
      setUploadPct(0);
      // reset input value so picking same file again triggers change
      e.target.value = '';
    }
  }

  function onDragOverHandler(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function onDragLeaveHandler(e) {
    e.preventDefault();
    setDragOver(false);
  }

  async function onDropHandler(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    // Only allow images
    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file.');
      return;
    }
    // Reuse picker logic
    const fakeInputEvent = { target: { files: [file], value: '' } };
    await onPickFile(fakeInputEvent);
  }

  return (
    <div
      className="card"
      onDragOver={onDragOverHandler}
      onDragLeave={onDragLeaveHandler}
      onDrop={onDropHandler}
      style={{
        outline: dragOver ? '2px dashed var(--primary)' : 'none',
        transition: 'outline 120ms ease-in-out'
      }}
    >
      <form onSubmit={submit}>
        <textarea
          rows={3}
          className="input"
          placeholder="What's happening?"
          maxLength={280}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="input"
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <label className="button secondary" style={{ cursor: 'pointer' }}>
            {uploadBusy ? 'Uploading...' : 'Choose file'}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onPickFile} />
          </label>
          {(previewSrc || imageUrl?.trim()) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={previewSrc || imageUrl} alt="preview" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} onError={() => { /* ignore preview errors */ }} />
              <button type="button" className="button secondary" onClick={() => { setImageUrl(''); if (previewSrc) { try { URL.revokeObjectURL(previewSrc); } catch {} setPreviewSrc(''); } }}>Remove</button>
            </div>
          )}
          {uploadBusy && (
            <div style={{ width: 160 }}>
              <div className="meta" style={{ marginBottom: 4 }}>Uploading {uploadPct}%</div>
              <div style={{ height: 6, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${uploadPct}%`, height: '100%', background: 'var(--primary)' }} />
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <span style={{ color: '#9ca3af', fontSize: 12 }}>{content.length}/280</span>
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
        {onClose && (
          <div style={{ marginTop: 8 }}>
            <button type="button" className="button secondary" onClick={onClose}>Close</button>
          </div>
        )}
        {error && <div style={{ color: 'salmon', marginTop: 8 }}>{error}</div>}
      </form>
    </div>
  );
}
