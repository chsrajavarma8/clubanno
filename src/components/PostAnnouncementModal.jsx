import { useState } from 'react'
import { CATEGORIES } from '../data/seed'

export default function PostAnnouncementModal({ club, onClose, onSubmit }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [link, setLink] = useState('')

  const canSubmit = title.trim() && body.trim()

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit({ title: title.trim(), body: body.trim(), category, link: link.trim() })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Announcement · {club.name}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Spring Hackathon Registrations Open"
            />
          </div>
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
            <label>Link (optional)</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://... (registration form, event page, etc.)"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSubmit} onClick={handleSubmit}>
            Post & Notify Members
          </button>
        </div>
      </div>
    </div>
  )
}
