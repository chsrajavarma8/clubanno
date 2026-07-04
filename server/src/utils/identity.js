// Shapes a MongoDB User doc into the identity object the frontend expects:
// null (never returned from here) | { type: 'admin', uid } | { type: 'club', clubId, ... }
export function toIdentity(user) {
  if (user.role === 'admin') {
    return { type: 'admin', uid: user._id.toString() }
  }
  if (user.role === 'user') {
    return { type: 'user', uid: user._id.toString(), username: user.username }
  }
  return {
    type: 'club',
    uid: user._id.toString(),
    clubId: user.clubId,
    name: user.name,
    icon: user.icon,
    description: user.description,
    category: user.category,
    status: user.status,
    customEmoji: user.customEmojiUrl,
    username: user.username,
  }
}
