import AnnouncementCard from './AnnouncementCard'

export default function AnnouncementFeed({ club, announcements }) {
  if (club.status === 'pending') {
    return (
      <div className="feed">
        <div className="pending-notice">
          <div className="pending-icon">⏳</div>
          <div>
            <strong>{club.name}</strong> is awaiting admin confirmation.
            <br />
            You'll be able to post announcements once it's approved.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="feed">
      <p className="club-description">{club.description}</p>
      {announcements.length === 0 ? (
        <div className="empty-state">No announcements match your filters yet.</div>
      ) : (
        announcements
          .slice()
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((a) => <AnnouncementCard key={a.id} announcement={a} />)
      )}
    </div>
  )
}
