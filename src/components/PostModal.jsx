import { useState } from 'react'
import { CATEGORIES, DEFAULT_DEADLINE_DAYS, MAX_DEADLINE_DAYS, MAX_POSTER_BYTES, POSTER_TYPES } from '../data/seed'

function formatBytes(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function meetsResolution(imgW, imgH, reqW, reqH) {
  const imgSorted = [imgW, imgH].sort((a, b) => a - b)
  const reqSorted = [reqW, reqH].sort((a, b) => a - b)
  return imgSorted[0] >= reqSorted[0] && imgSorted[1] >= reqSorted[1]
}

export default function PostModal({ club, onClose, onSubmit }) {
  const [postType, setPostType] = useState('announcement')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [link, setLink] = useState('')
  const [reelLink, setReelLink] = useState('')
  const [deadlineDays, setDeadlineDays] = useState(DEFAULT_DEADLINE_DAYS)
  const [posterTypeId, setPosterTypeId] = useState(POSTER_TYPES[0].id)
  const [poster, setPoster] = useState(null) // { name, dataUrl, width, height }
  const [error, setError] = useState('')
  const [checkingImage, setCheckingImage] = useState(false)

  const posterType = POSTER_TYPES.find((t) => t.id === posterTypeId)

  function handlePosterChange(e) {
    const file = e.target.files?.[0]
    setError('')
    setPoster(null)
    if (!file) return

    if (file.type.startsWith('video/')) {
      setError('Videos aren\'t allowed on announcements. Use a Promotion with an Instagram Reel link instead.')
      e.target.value = ''
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Poster must be an image file.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_POSTER_BYTES) {
      setError(`Poster is too large (${formatBytes(file.size)}). Max size is 20 MB.`)
      e.target.value = ''
      return
    }

    setCheckingImage(true)
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        setCheckingImage(false)
        if (!meetsResolution(img.naturalWidth, img.naturalHeight, posterType.width, posterType.height)) {
          setError(
            `Image is too small for ${posterType.label} (${posterType.inches}). Needs at least ${posterType.width}×${posterType.height}px at 300 DPI — yours is ${img.naturalWidth}×${img.naturalHeight}px.`
          )
          e.target.value = ''
          return
        }
        setPoster({ name: file.name, dataUrl: reader.result, width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = () => {
        setCheckingImage(false)
        setError('Could not read that image file.')
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  const canSubmit =
    title.trim() &&
    (postType === 'announcement' ? body.trim() : body.trim() && reelLink.trim())

  function handleSubmit() {
    if (!canSubmit) return
    setError('')

    if (postType === 'announcement') {
      const days = Math.min(Math.max(Number(deadlineDays) || DEFAULT_DEADLINE_DAYS, 1), MAX_DEADLINE_DAYS)
      onSubmit({
        type: 'announcement',
        title: title.trim(),
        body: body.trim(),
        category,
        link: link.trim(),
        poster: poster?.dataUrl || null,
        posterType: poster ? posterType.label : null,
        deadlineDays: days,
      })
    } else {
      if (!/instagram\.com/i.test(reelLink.trim())) {
        setError('Please add a valid Instagram Reel link.')
        return
      }
      onSubmit({
        type: 'promotion',
        title: title.trim(),
        body: body.trim(),
        reelLink: reelLink.trim(),
      })
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Post · {club.name}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="approval-note">
            Every post is reviewed by an admin before it appears publicly.
          </div>

          <div className="type-toggle">
            <button
              className={`type-btn${postType === 'announcement' ? ' selected' : ''}`}
              onClick={() => setPostType('announcement')}
            >
              📢 Announcement
            </button>
            <button
              className={`type-btn${postType === 'promotion' ? ' selected' : ''}`}
              onClick={() => setPostType('promotion')}
            >
              🎬 Promotion (Reel)
            </button>
          </div>

          <div className="field">
            <label>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={postType === 'announcement' ? 'e.g. Spring Hackathon Registrations Open' : 'e.g. Watch our recruitment reel'}
            />
          </div>

          {postType === 'announcement' ? (
            <>
              <div className="field">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Details</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What, when, where — keep it short and clear."
                />
              </div>
              <div className="field">
                <label>Link (optional — form, event page, etc.)</label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="field">
                <label>Poster size (optional)</label>
                <div className="poster-type-table">
                  {POSTER_TYPES.map((t) => (
                    <label key={t.id} className={`poster-type-row${posterTypeId === t.id ? ' selected' : ''}`}>
                      <input
                        type="radio"
                        name="posterType"
                        checked={posterTypeId === t.id}
                        onChange={() => { setPosterTypeId(t.id); setPoster(null) }}
                      />
                      <span className="poster-type-label">{t.label}</span>
                      <span className="poster-type-meta">{t.inches}</span>
                      <span className="poster-type-meta">{t.width}×{t.height}px</span>
                      <span className="poster-type-usage">{t.usage}</span>
                    </label>
                  ))}
                </div>
                <input type="file" accept="image/*" onChange={handlePosterChange} />
                {checkingImage && <div className="file-chip">Checking image resolution…</div>}
                {poster && (
                  <div className="file-chip">
                    {poster.name} — {poster.width}×{poster.height}px ✓ meets {posterType.label} requirement
                  </div>
                )}
              </div>

              <div className="field">
                <label>Auto-remove after (days, max {MAX_DEADLINE_DAYS})</label>
                <input
                  type="number"
                  min={1}
                  max={MAX_DEADLINE_DAYS}
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="field">
                <label>Caption</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Short caption for this promo."
                />
              </div>
              <div className="field">
                <label>Instagram Reel Link</label>
                <input
                  type="url"
                  value={reelLink}
                  onChange={(e) => setReelLink(e.target.value)}
                  placeholder="https://www.instagram.com/reel/..."
                />
              </div>
            </>
          )}

          {error && <div className="form-error">{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSubmit} onClick={handleSubmit}>
            Submit for Admin Approval
          </button>
        </div>
      </div>
    </div>
  )
}
