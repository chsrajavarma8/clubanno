import { useEffect, useMemo, useState } from 'react'
import { Megaphone, ShieldCheck, LogOut, LogIn, Smile, Menu } from 'lucide-react'
import Sidebar from './components/Sidebar'
import FilterBar from './components/FilterBar'
import PostFeed from './components/PostFeed'
import NotificationBell from './components/NotificationBell'
import PostModal from './components/PostModal'
import LoginModal from './components/LoginModal'
import AdminPanelModal from './components/AdminPanelModal'
import EmojiUploadModal from './components/EmojiUploadModal'
import Toast from './components/Toast'
import * as authService from './services/auth'
import * as clubsService from './services/clubs'
import * as postsService from './services/posts'
import * as notificationsService from './services/notifications'

const DAY_MS = 24 * 60 * 60 * 1000

export default function App() {
  const [clubs, setClubs] = useState([])
  const [posts, setPosts] = useState([])
  const [reactions, setReactions] = useState({}) // { [postId]: { [emoji]: count } }
  const [notifications, setNotifications] = useState([])
  const [selectedClubId, setSelectedClubId] = useState(null)
  const [activeTab, setActiveTab] = useState('announcements') // 'announcements' | 'promotions'
  const [activeFilters, setActiveFilters] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showEmojiModal, setShowEmojiModal] = useState(false)
  const [currentUser, setCurrentUser] = useState(null) // null | {type:'admin'} | {type:'club', clubId, name}
  const [toast, setToast] = useState(null)
  const [notifiedExpiryIds, setNotifiedExpiryIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const selectedClub = clubs.find((c) => c.id === selectedClubId)

  const clubTabPosts = useMemo(() => {
    if (!selectedClubId) return []
    return posts.filter((p) => {
      if (p.clubId !== selectedClubId) return false
      if (p.status !== 'approved') return false
      if (p.type !== (activeTab === 'announcements' ? 'announcement' : 'promotion')) return false
      if (p.type === 'announcement' && p.expiresAt && Date.now() > p.expiresAt) return false
      return true
    })
  }, [posts, selectedClubId, activeTab])

  const visiblePosts = useMemo(() => {
    if (activeTab !== 'announcements' || activeFilters.length === 0) return clubTabPosts
    return clubTabPosts.filter((p) => activeFilters.includes(p.category))
  }, [clubTabPosts, activeTab, activeFilters])

  const pendingPosts = useMemo(() => posts.filter((p) => p.status === 'pending'), [posts])

  const visibleNotifications = useMemo(() => {
    if (currentUser?.type === 'admin') return notifications.filter((n) => n.audience === 'admin')
    if (currentUser?.type === 'club') return notifications.filter((n) => n.audience === 'public' || n.audience === currentUser.clubId)
    return notifications.filter((n) => n.audience === 'public')
  }, [notifications, currentUser])

  const unreadCount = visibleNotifications.filter((n) => !n.read).length
  const canPostToSelected = currentUser?.type === 'club' && currentUser.clubId === selectedClubId

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  // Load clubs/posts/notifications from MongoDB once at startup, and restore
  // a logged-in session after a page refresh.
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [clubsData, postsData, notificationsData, identity] = await Promise.all([
          clubsService.fetchClubs(),
          postsService.fetchPosts(),
          notificationsService.fetchNotifications(),
          authService.getCurrentIdentity(),
        ])
        if (cancelled) return
        setClubs(clubsData)
        setPosts(postsData)
        setReactions(Object.fromEntries(postsData.map((p) => [p.id, p.reactions || {}])))
        setNotifications(notificationsData)
        if (identity) {
          setCurrentUser(identity)
          setSelectedClubId(identity.type === 'club' ? identity.clubId : clubsData[0]?.id ?? null)
        } else {
          setSelectedClubId(clubsData[0]?.id ?? null)
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // System notification pull: warn a club when one of their live announcements
  // is about to expire (within 2 days of its deadline).
  useEffect(() => {
    const soon = posts.filter((p) => {
      if (p.type !== 'announcement' || p.status !== 'approved' || !p.expiresAt) return false
      if (notifiedExpiryIds.has(p.id)) return false
      const msLeft = p.expiresAt - Date.now()
      return msLeft > 0 && msLeft <= 2 * DAY_MS
    })
    if (soon.length === 0) return

    setNotifiedExpiryIds((prev) => new Set([...prev, ...soon.map((p) => p.id)]))

    Promise.all(
      soon.map((p) => {
        const daysLeft = Math.max(1, Math.ceil((p.expiresAt - Date.now()) / DAY_MS))
        return notificationsService.createNotification({
          audience: p.clubId,
          title: 'Announcement expiring soon',
          body: `"${p.title}" expires in ${daysLeft}d. Repost it if you'd like it to stay visible.`,
        })
      })
    )
      .then((created) => setNotifications((prev) => [...created, ...prev]))
      .catch((err) => console.error('Could not create expiry notification:', err.message))
  }, [posts, notifiedExpiryIds])

  function toggleFilter(cat) {
    setActiveFilters((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))
  }

  function handleSelectClub(id) {
    setSelectedClubId(id)
    setActiveFilters([])
    setActiveTab('announcements')
  }

  function handleToggleNotifPanel() {
    setNotifOpen((open) => {
      const next = !open
      if (next) {
        const audiences =
          currentUser?.type === 'admin'
            ? ['admin']
            : currentUser?.type === 'club'
            ? ['public', currentUser.clubId]
            : ['public']
        setNotifications((prev) => prev.map((n) => (audiences.includes(n.audience) ? { ...n, read: true } : n)))
        notificationsService.markNotificationsRead(audiences).catch((err) => console.error(err))
      }
      return next
    })
  }

  async function handleLogin({ username, password }) {
    try {
      const identity = await authService.login(username, password)
      setCurrentUser(identity)
      if (identity.type === 'club') setSelectedClubId(identity.clubId)
      setShowLoginModal(false)
      setToast(
        identity.type === 'admin'
          ? { title: 'Logged in as Admin', body: 'You can now review pending posts and manage clubs.' }
          : { title: `Logged in as ${identity.name}`, body: 'You can now submit posts for admin approval.' }
      )
      return {}
    } catch (err) {
      return { error: err.message }
    }
  }

  async function handleLogout() {
    await authService.logout()
    setCurrentUser(null)
    setShowAdminPanel(false)
  }

  async function handleSubmitPost(data) {
    try {
      const post = await postsService.createPost(data)
      setPosts((prev) => [post, ...prev])
      setReactions((prev) => ({ ...prev, [post.id]: post.reactions || {} }))
      setToast({ title: 'Submitted for review', body: 'An admin will approve or reject this before it goes public.' })
      setShowPostModal(false)
      notificationsService.fetchNotifications().then(setNotifications).catch(() => {})
    } catch (err) {
      setToast({ title: 'Could not submit post', body: err.message })
    }
  }

  async function handleApprovePost(postId) {
    try {
      const updated = await postsService.approvePost(postId)
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)))
      setToast({ title: 'Post approved', body: `"${updated.title}" is now public.` })
      notificationsService.fetchNotifications().then(setNotifications).catch(() => {})
    } catch (err) {
      setToast({ title: 'Could not approve post', body: err.message })
    }
  }

  async function handleRejectPost(postId) {
    const post = posts.find((p) => p.id === postId)
    try {
      await postsService.rejectPost(postId)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      setToast({ title: 'Post rejected', body: `"${post?.title}" was removed from the queue.` })
      notificationsService.fetchNotifications().then(setNotifications).catch(() => {})
    } catch (err) {
      setToast({ title: 'Could not reject post', body: err.message })
    }
  }

  // Creates the club's login credentials in MongoDB first; only adds it to
  // the local club list once that succeeds. Throws on failure so the Admin
  // Panel form can show the error inline.
  async function handleCreateClub({ name, description, category, icon, username, password }) {
    const created = await authService.createClubAccount({ name, description, category, icon, username, password })
    const club = { id: created.id, name: created.name, description: created.description, category: created.category, icon: created.icon, status: created.status, username: created.username, customEmoji: created.customEmoji }
    setClubs((prev) => [...prev, club])
    setToast({ title: 'Club created', body: `${name} is live and can log in now.` })
  }

  // A club deleting their own post, or an admin deleting any post.
  async function handleDeletePost(postId) {
    const post = posts.find((p) => p.id === postId)
    try {
      await postsService.deletePost(postId)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      setReactions((prev) => {
        const next = { ...prev }
        delete next[postId]
        return next
      })
      setToast({ title: 'Post deleted', body: post ? `"${post.title}" was removed.` : 'The post was removed.' })
      notificationsService.fetchNotifications().then(setNotifications).catch(() => {})
    } catch (err) {
      setToast({ title: 'Could not delete post', body: err.message })
    }
  }

  // Admin-only: permanently removes a club, its login, and all its posts.
  async function handleDeleteClub(clubId) {
    const club = clubs.find((c) => c.id === clubId)
    try {
      await clubsService.deleteClub(clubId)
      setClubs((prev) => prev.filter((c) => c.id !== clubId))
      setPosts((prev) => prev.filter((p) => p.clubId !== clubId))
      if (selectedClubId === clubId) {
        const remaining = clubs.filter((c) => c.id !== clubId)
        setSelectedClubId(remaining[0]?.id ?? null)
      }
      setToast({ title: 'Club deleted', body: club ? `${club.name} and its posts were removed.` : 'The club was removed.' })
    } catch (err) {
      setToast({ title: 'Could not delete club', body: err.message })
    }
  }

  async function handleSaveEmoji(dataUrl) {
    try {
      const updated = await clubsService.updateClubEmoji(selectedClubId, dataUrl)
      setClubs((prev) => prev.map((c) => (c.id === selectedClubId ? { ...c, customEmoji: updated.customEmoji } : c)))
      setShowEmojiModal(false)
      setToast({ title: 'Custom emoji saved', body: `${selectedClub.name} now has a custom reaction emoji.` })
    } catch (err) {
      setToast({ title: 'Could not save emoji', body: err.message })
    }
  }

  // Optimistic: updates the UI immediately, then persists in the background
  // and reconciles with the server's authoritative count.
  function handleReact(postId, emoji) {
    setReactions((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], [emoji]: (prev[postId]?.[emoji] || 0) + 1 },
    }))
    postsService
      .reactToPost(postId, emoji)
      .then((updated) => {
        setReactions((prev) => ({ ...prev, [postId]: updated.reactions || {} }))
        setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)))
      })
      .catch((err) => console.error('Reaction failed to save:', err.message))
  }

  if (loading) {
    return (
      <div className="app">
        <div className="main" style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div className="spinner" />
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading Community Hub…</div>
        </div>
      </div>
    )
  }

  if (loadError || !selectedClub) {
    return (
      <div className="app">
        <div className="main" style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ fontSize: 28 }}>⚠️</div>
          <div style={{ color: 'var(--text-secondary)' }}>Couldn't load the app{loadError ? `: ${loadError}` : '.'}</div>
          <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Sidebar
        clubs={clubs}
        selectedClubId={selectedClubId}
        onSelectClub={handleSelectClub}
        currentUser={currentUser}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="main">
        <div className="topbar">
          <div className="topbar-title">
            <button className="icon-btn mobile-menu-btn" onClick={() => setMobileNavOpen(true)} aria-label="Open club list">
              <Menu size={20} />
            </button>
            <span>{selectedClub.icon}</span>
            <span>{selectedClub.name}</span>
          </div>
          <div className="topbar-actions">
            {canPostToSelected && (
              <>
                <button className="icon-btn" onClick={() => setShowEmojiModal(true)} aria-label="Custom emoji" title="Custom emoji">
                  <Smile size={18} />
                </button>
                <button className="btn-primary" onClick={() => setShowPostModal(true)}>
                  <Megaphone size={14} /> <span className="btn-label">New Post</span>
                </button>
              </>
            )}

            {currentUser?.type === 'admin' && (
              <button className="btn-secondary" onClick={() => setShowAdminPanel(true)}>
                <ShieldCheck size={14} /> <span className="btn-label">Admin Panel</span>
                {pendingPosts.length > 0 && <span className="tab-badge">{pendingPosts.length}</span>}
              </button>
            )}

            <NotificationBell
              notifications={visibleNotifications}
              unreadCount={unreadCount}
              open={notifOpen}
              onToggle={handleToggleNotifPanel}
            />

            {currentUser ? (
              <button className="icon-btn" onClick={handleLogout} aria-label="Log out" title="Log out">
                <LogOut size={18} />
              </button>
            ) : (
              <button className="btn-secondary" onClick={() => setShowLoginModal(true)}>
                <LogIn size={14} /> <span className="btn-label">Log In</span>
              </button>
            )}
          </div>
        </div>

        {selectedClub.status === 'active' && (
          <div className="tab-row">
            <button className={`tab-btn${activeTab === 'announcements' ? ' selected' : ''}`} onClick={() => setActiveTab('announcements')}>
              Announcements
            </button>
            <button className={`tab-btn${activeTab === 'promotions' ? ' selected' : ''}`} onClick={() => setActiveTab('promotions')}>
              Promotions
            </button>
          </div>
        )}

        {selectedClub.status === 'active' && activeTab === 'announcements' && (
          <FilterBar
            activeFilters={activeFilters}
            onToggleFilter={toggleFilter}
            onClear={() => setActiveFilters([])}
            matchCount={visiblePosts.length}
            totalCount={clubTabPosts.length}
          />
        )}

        <PostFeed
          club={selectedClub}
          posts={visiblePosts}
          activeTab={activeTab}
          reactions={reactions}
          onReact={handleReact}
          currentUser={currentUser}
          onDeletePost={handleDeletePost}
        />
      </div>

      {showPostModal && (
        <PostModal club={selectedClub} onClose={() => setShowPostModal(false)} onSubmit={handleSubmitPost} />
      )}

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} onLogin={handleLogin} />
      )}

      {showAdminPanel && (
        <AdminPanelModal
          pendingPosts={pendingPosts}
          clubs={clubs}
          onApprovePost={handleApprovePost}
          onRejectPost={handleRejectPost}
          onCreateClub={handleCreateClub}
          onDeleteClub={handleDeleteClub}
          existingUsernames={clubs.map((c) => c.username.toLowerCase())}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      {showEmojiModal && (
        <EmojiUploadModal club={selectedClub} onClose={() => setShowEmojiModal(false)} onSave={handleSaveEmoji} />
      )}

      <Toast toast={toast} />
    </div>
  )
}
