import { useState } from 'react'
import { CATEGORIES, CLUB_ICONS } from '../data/seed'

export default function CreateClubModal({ onClose, onSubmit, existingUsernames }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [icon, setIcon] = useState(CLUB_ICONS[0])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const canSubmit = name.trim() && description.trim() && username.trim() && password.trim()

  function handleSubmit() {
    if (!canSubmit) return
    const uname = username.trim().toLowerCase()
    if (existingUsernames.includes(uname)) {
      setError('That username is already taken. Choose another.')
      return
    }
    if (password.trim().length < 6) {
      setError('Password should be at least 6 characters.')
      return
    }
    onSubmit({ name: name.trim(), description: description.trim(), category, icon, username: uname, password: password.trim() })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create a Club</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="approval-note">
            New clubs need admin confirmation before they go live. Your club will
            show as "Pending" and your login won't work until it's approved.
          </div>
          <div className="field">
            <label>Club Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chess Club"
            />
          </div>
          <div className="field">
            <label>Primary Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Icon</label>
            <div className="icon-picker">
              {CLUB_ICONS.map((ic) => (
                <div
                  key={ic}
                  className={`icon-option${icon === ic ? ' selected' : ''}`}
                  onClick={() => setIcon(ic)}
                >
                  {ic}
                </div>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this club about?"
            />
          </div>

          <div className="approval-note" style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
            Set the login your club committee will use once approved.
          </div>
          <div className="field">
            <label>Club Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. chessclub"
            />
          </div>
          <div className="field">
            <label>Club Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          {error && <div className="form-error">{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!canSubmit} onClick={handleSubmit}>
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  )
}
