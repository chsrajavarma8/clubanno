export default function Sidebar({ clubs, selectedClubId, onSelectClub, currentUser }) {
  const activeClubs = clubs.filter((c) => c.status === 'active')

  let badgeText = 'Browsing as Guest'
  if (currentUser?.type === 'admin') badgeText = 'Logged in · Admin'
  if (currentUser?.type === 'club') badgeText = `Logged in · ${currentUser.name} Committee`

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Community Hub</h1>
        <span className="role-badge">{badgeText}</span>
      </div>

      <div className="club-list">
        <div className="sidebar-section">Clubs</div>
        {activeClubs.map((club) => (
          <div
            key={club.id}
            className={`club-item${selectedClubId === club.id ? ' active' : ''}`}
            onClick={() => onSelectClub(club.id)}
          >
            <span className="club-icon">{club.icon}</span>
            <span className="club-name">{club.name}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}
