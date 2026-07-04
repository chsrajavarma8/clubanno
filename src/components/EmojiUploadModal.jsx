import { useState } from 'react'
import { MAX_EMOJI_BYTES } from '../data/seed'

export default function EmojiUploadModal({ club, onClose, onSave }) {
  const [preview, setPreview] = useState(club.customEmoji || null)
  const [error, setError] = useState('')

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    setError('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Custom emoji must be an image file.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_EMOJI_BYTES) {
      setError(`File is too large (${Math.round(file.size / 1024)} KB). Max size is 100 KB.`)
      e.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Custom Emoji · {club.name}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="approval-note" style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
            Upload a small image (max 100 KB) to use as your club's custom reaction emoji.
          </div>
          <div className="field">
            <label>Emoji Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          {preview && (
            <div className="emoji-preview">
              <img src={preview} alt="preview" />
              <span>Preview</span>
            </div>
          )}
          {error && <div className="form-error">{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!preview} onClick={() => onSave(preview)}>
            Save Emoji
          </button>
        </div>
      </div>
    </div>
  )
}
