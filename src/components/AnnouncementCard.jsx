import { memo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import ReactionBar from './ReactionBar'
import ImageLightbox from './ImageLightbox'

function timeAgo(ts) {
  const diff = Date.now() - ts
  const hrs = Math.floor(diff / (1000 * 60 * 60))
  if (hrs < 1) return 'just now'
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function daysLeft(expiresAt) {
  return Math.max(1, Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
}

function AnnouncementCard({ announcement, club, reactions, onReact, canDelete, onDelete, currentUser, onRequireLogin }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  function handleLinkClick(e) {
    if (!currentUser) {
      e.preventDefault()
      onRequireLogin?.()
    }
  }

  return (
    <div className="announcement-card">
      <div className="announcement-top">
        <span className="category-tag">{announcement.category}</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {announcement.expiresAt && (
            <span className="deadline-tag">Expires in {daysLeft(announcement.expiresAt)}d</span>
          )}
          <span className="announcement-time">{timeAgo(announcement.timestamp)}</span>
          {canDelete && (
            <button
              className="icon-btn-sm danger"
              onClick={() => onDelete(announcement.id)}
              aria-label="Delete announcement"
              title="Delete announcement"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="announcement-title">{announcement.title}</div>
      {announcement.poster && (
        <div className="poster-wrap">
          <img
            className="announcement-poster poster-clickable"
            src={announcement.poster}
            alt=""
            onClick={() => setLightboxOpen(true)}
          />
          {announcement.posterType && <span className="poster-size-tag">{announcement.posterType}</span>}
        </div>
      )}
      <div className="announcement-body">{announcement.body}</div>
      {announcement.link && (
        <a
          className="announcement-link"
          href={announcement.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
        >
          Open Link ↗
        </a>
      )}
      <div className="announcement-author">Posted by {announcement.author}</div>
      <ReactionBar club={club} reactions={reactions} onReact={(emoji) => onReact(announcement.id, emoji)} />

      {lightboxOpen && (
        <ImageLightbox src={announcement.poster} alt={announcement.title} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  )
}

export default memo(AnnouncementCard)
