// Shapes a MongoDB User doc into the identity object the frontend expects:
// null (never returned from here) | { type: 'admin', uid } | { type: 'club', clubId, ... }
export function toIdentity(user) {
  if (user.role === 'admin') {
    return { type: 'admin', uid: user._id.toString() }
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
