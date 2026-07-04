import { Bell } from 'lucide-react'

function timeAgo(ts) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / (1000 * 60))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ago`
}

export default function NotificationBell({ notifications, unreadCount, open, onToggle }) {
  return (
    <div style={{ position: 'relative' }}>
      <button className="icon-btn" onClick={onToggle} aria-label="Notifications">
        <Bell size={18} />
        {unreadCount > 0 && <span className="badge-dot">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">Notifications</div>
          {notifications.length === 0 ? (
            <div className="notif-empty">You're all caught up.</div>
          ) : (
            notifications
              .slice()
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((n) => (
                <div key={n.id} className="notif-item">
                  <div className="notif-item-title">{n.title}</div>
                  <div>{n.body}</div>
                  <div className="notif-item-time">{timeAgo(n.timestamp)}</div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  )
}
