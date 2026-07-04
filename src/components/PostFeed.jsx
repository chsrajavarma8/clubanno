import { useMemo } from 'react'
import AnnouncementCard from './AnnouncementCard'
import PromotionCard from './PromotionCard'

export default function PostFeed({ club, posts, activeTab, reactions, onReact, currentUser, onDeletePost, onRequireLogin }) {
  if (club.status === 'pending') {
    return (
      <div className="feed">
        <div className="pending-notice">
          <div className="pending-icon">⏳</div>
          <div>
            <strong>{club.name}</strong> is awaiting admin confirmation.
          </div>
        </div>
      </div>
    )
  }

  function canDeletePost(post) {
    if (currentUser?.type === 'admin') return true
    if (currentUser?.type === 'club' && currentUser.clubId === post.clubId) return true
    return false
  }

  const sortedPosts = useMemo(
    () => posts.slice().sort((a, b) => b.timestamp - a.timestamp),
    [posts]
  )

  return (
    <div className="feed">
      {activeTab === 'announcements' && <p className="club-description">{club.description}</p>}

      {posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{activeTab === 'announcements' ? '📭' : '🎬'}</div>
          <div>
            {activeTab === 'announcements'
              ? 'No announcements match your filters yet.'
              : 'No promotions posted yet.'}
          </div>
        </div>
      ) : (
        sortedPosts.map((post) =>
          post.type === 'announcement' ? (
            <AnnouncementCard
              key={post.id}
              announcement={post}
              club={club}
              reactions={reactions[post.id]}
              onReact={onReact}
              canDelete={canDeletePost(post)}
              onDelete={onDeletePost}
              currentUser={currentUser}
              onRequireLogin={onRequireLogin}
            />
          ) : (
            <PromotionCard
              key={post.id}
              promotion={post}
              club={club}
              reactions={reactions[post.id]}
              onReact={onReact}
              canDelete={canDeletePost(post)}
              onDelete={onDeletePost}
              currentUser={currentUser}
              onRequireLogin={onRequireLogin}
            />
          )
        )
      )}
    </div>
  )
}
