import { Trash2 } from 'lucide-react'
import ReactionBar from './ReactionBar'

function timeAgo(ts) {
  const diff = Date.now() - ts
  const hrs = Math.floor(diff / (1000 * 60 * 60))
  if (hrs < 1) return 'just now'
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function PromotionCard({ promotion, club, reactions, onReact, canDelete, onDelete }) {
  return (
    <div className="announcement-card">
      <div className="announcement-top">
        <span className="category-tag promo-tag">🎬 Promotion</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="announcement-time">{timeAgo(promotion.timestamp)}</span>
          {canDelete && (
            <button
              className="icon-btn-sm danger"
              onClick={() => onDelete(promotion.id)}
              aria-label="Delete promotion"
              title="Delete promotion"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="announcement-title">{promotion.title}</div>
      <div className="announcement-body">{promotion.body}</div>
      <a
        className="announcement-link"
        href={promotion.reelLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        ▶ Watch Reel on Instagram
      </a>
      <div className="announcement-author">Posted by {promotion.author}</div>
      <ReactionBar club={club} reactions={reactions} onReact={(emoji) => onReact(promotion.id, emoji)} />
    </div>
  )
}
