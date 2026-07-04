import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { CATEGORIES, CLUB_ICONS } from '../data/seed'

function timeAgo(ts) {
  const diff = Date.now() - ts
  const hrs = Math.floor(diff / (1000 * 60 * 60))
  if (hrs < 1) return 'just now'
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function AdminPanelModal({
  pendingPosts,
  clubs,
  onApprovePost,
  onRejectPost,
  onCreateClub,
  onDeleteClub,
  existingUsernames,
  onClose,
}) {
  const [tab, setTab] = useState('pending')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [icon, setIcon] = useState(CLUB_ICONS[0])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [creating, setCreating] = useState(false)
  const [confirmingClubId, setConfirmingClubId] = useState(null)
  const [deletingClubId, setDeletingClubId] = useState(null)

  async function handleConfirmDeleteClub(clubId) {
    setDeletingClubId(clubId)
    try {
      await onDeleteClub(clubId)
    } finally {
      setDeletingClubId(null)
      setConfirmingClubId(null)
    }
  }

  const canCreate = name.trim() && description.trim() && username.trim() && password.trim()

  async function handleCreate() {
    if (!canCreate || creating) return
    const uname = username.trim().toLowerCase()
    if (existingUsernames.includes(uname)) {
      setFormError('That username is already taken. Choose another.')
      return
    }
    if (password.trim().length < 6) {
      setFormError('Password should be at least 6 characters.')
      return
    }
    setCreating(true)
    setFormError('')
    try {
      await onCreateClub({ name: name.trim(), description: description.trim(), category, icon, username: uname, password: password.trim() })
      setName(''); setDescription(''); setUsername(''); setPassword(''); setFormError('')
      setTab('clubs')
    } catch (err) {
      setFormError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const clubById = Object.fromEntries(clubs.map((c) => [c.id, c]))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Admin Panel</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="admin-tabs">
          <button className={`admin-tab${tab === 'pending' ? ' selected' : ''}`} onClick={() => setTab('pending')}>
            Pending Posts ({pendingPosts.length})
          </button>
          <button className={`admin-tab${tab === 'create' ? ' selected' : ''}`} onClick={() => setTab('create')}>
            Create Club
          </button>
          <button className={`admin-tab${tab === 'clubs' ? ' selected' : ''}`} onClick={() => setTab('clubs')}>
            All Clubs ({clubs.length})
          </button>
        </div>

        <div className="modal-body">
          {tab === 'pending' && (
            pendingPosts.length === 0 ? (
              <div className="notif-empty">No posts waiting for review.</div>
            ) : (
              pendingPosts.map((post) => (
                <div className="admin-request-card" key={post.id}>
                  <div className="admin-request-top">
                    <span className="club-icon">{clubById[post.clubId]?.icon}</span>
                    <div>
                      <div className="admin-request-name">
                        {post.title}{' '}
                        <span className="post-type-tag">{post.type === 'promotion' ? '🎬 Promotion' : '📢 Announcement'}</span>
                      </div>
                      <div className="admin-request-meta">
                        {clubById[post.clubId]?.name} · {timeAgo(post.timestamp)}
                        {post.type === 'announcement' && ` · ${post.category}`}
                      </div>
                    </div>
                  </div>
                  {post.poster && <img className="announcement-poster" src={post.poster} alt="" />}
                  <p className="admin-request-desc">{post.body}</p>
                  {post.link && <div className="admin-request-meta">Link: {post.link}</div>}
                  {post.reelLink && <div className="admin-request-meta">Reel: {post.reelLink}</div>}
                  <div className="admin-request-actions">
                    <button className="btn-secondary" onClick={() => onRejectPost(post.id)}>Reject</button>
                    <button className="btn-primary" onClick={() => onApprovePost(post.id)}>Approve</button>
                  </div>
                </div>
              ))
            )
          )}

          {tab === 'create' && (
            <>
              <div className="field">
                <label>Club Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chess Club" />
              </div>
              <div className="field">
                <label>Primary Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Icon</label>
                <div className="icon-picker">
                  {CLUB_ICONS.map((ic) => (
                    <div key={ic} className={`icon-option${icon === ic ? ' selected' : ''}`} onClick={() => setIcon(ic)}>
                      {ic}
                    </div>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this club about?" />
              </div>
              <div className="field">
                <label>Club Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. chessclub" />
              </div>
              <div className="field">
                <label>Club Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
              </div>
              {formError && <div className="form-error">{formError}</div>}
              <button className="btn-primary" disabled={!canCreate || creating} onClick={handleCreate} style={{ alignSelf: 'flex-start' }}>
                {creating ? 'Creating…' : 'Create & Activate Club'}
              </button>
            </>
          )}

          {tab === 'clubs' && (
            clubs.map((club) => (
              <div className="admin-active-row" key={club.id}>
                <span className="club-icon">{club.icon}</span>
                <span>{club.name}</span>
                <span className="admin-request-meta">Login: {club.username}</span>
                <div className="admin-row-actions">
                  <span className="admin-request-meta">{club.postCount ?? 0} post{club.postCount === 1 ? '' : 's'}</span>
                  {confirmingClubId === club.id ? (
                    <div className="confirm-inline">
                      <span>Delete {club.name}?</span>
                      <button className="btn-secondary btn-tiny" onClick={() => setConfirmingClubId(null)}>Cancel</button>
                      <button
                        className="btn-danger btn-tiny"
                        disabled={deletingClubId === club.id}
                        onClick={() => handleConfirmDeleteClub(club.id)}
                      >
                        {deletingClubId === club.id ? 'Deleting…' : 'Confirm'}
                      </button>
                    </div>
                  ) : (
                    <button
                      className="icon-btn-sm danger"
                      onClick={() => setConfirmingClubId(club.id)}
                      aria-label={`Delete ${club.name}`}
                      title="Delete club"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
