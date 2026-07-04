import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { CATEGORIES, CLUB_ICONS } from '../data/seed'
import * as authService from '../services/auth'

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString()
}

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
  const [students, setStudents] = useState(null) // null = not loaded yet
  const [studentsError, setStudentsError] = useState('')
  const [studentsLoading, setStudentsLoading] = useState(false)

  useEffect(() => {
    if (tab !== 'students' || students !== null || studentsLoading) return
    setStudentsLoading(true)
    setStudentsError('')
    authService
      .getStudents()
      .then(setStudents)
      .catch((err) => setStudentsError(err.message))
      .finally(() => setStudentsLoading(false))
  }, [tab, students, studentsLoading])

  async function handleConfirmDeleteClub(clubId) {
    setDeletingClubId(clubId)
    try {
      await onDeleteClub(clubId)
    } finally {
      setDeletingClubId(null)
      setConfirmingClubId(null)
    }
  }

  const ALLOWED_DOMAINS = ['student.gitam.edu', 'gitam.in']
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  function isGitamEmail(email) {
    if (!EMAIL_RE.test(email)) return false
    const domain = email.split('@')[1]?.toLowerCase()
    return ALLOWED_DOMAINS.includes(domain)
  }
  const canCreate = name.trim() && description.trim() && username.trim() && password.trim()

  async function handleCreate() {
    if (!canCreate || creating) return
    const uname = username.trim().toLowerCase()
    if (!isGitamEmail(uname)) {
      setFormError('Use a GITAM email (e.g. clubname@gitam.in or name@student.gitam.edu).')
      return
    }
    if (existingUsernames.includes(uname)) {
      setFormError('That email is already registered to a club. Use another.')
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
          <button className={`admin-tab${tab === 'students' ? ' selected' : ''}`} onClick={() => setTab('students')}>
            Students{students ? ` (${students.length})` : ''}
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
                <label>Club Email</label>
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. chessclub@gitam.in"
                />
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
                <span className="admin-request-meta">Email: {club.username}</span>
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

          {tab === 'students' && (
            studentsLoading ? (
              <div className="notif-empty">Loading students…</div>
            ) : studentsError ? (
              <div className="form-error">{studentsError}</div>
            ) : !students || students.length === 0 ? (
              <div className="notif-empty">No students have signed up yet.</div>
            ) : (
              students.map((s) => (
                <div className="admin-active-row" key={s.id}>
                  <span className="club-icon">🎓</span>
                  <span>{s.email}</span>
                  <span className="admin-request-meta">DOB: {formatDate(s.dob)}</span>
                  <span className="admin-request-meta">Joined: {formatDate(s.joinedAt)}</span>
                </div>
              ))
            )
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
