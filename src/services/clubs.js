import { apiFetch, parseJson } from './api'

export async function fetchClubs() {
  const res = await apiFetch('/api/clubs')
  const data = await parseJson(res, 'Could not load clubs.')
  return data.clubs
}

export async function deleteClub(clubId) {
  const res = await apiFetch(`/api/clubs/${encodeURIComponent(clubId)}/delete`, { method: 'POST' })
  const data = await parseJson(res, 'Could not delete club.')
  return data
}

export async function updateClubEmoji(clubId, customEmojiUrl) {
  const res = await apiFetch(`/api/clubs/${encodeURIComponent(clubId)}/emoji`, {
    method: 'POST',
    body: JSON.stringify({ customEmojiUrl }),
  })
  const data = await parseJson(res, 'Could not save emoji.')
  return data.club
}
