// Talks to the MongoDB-backed auth API (see /server) — login, logout, and
// session restore.
import { apiFetch, parseJson, getToken, setToken } from './api'

// identity: null (guest) | { type: 'admin', uid } | { type: 'club', clubId, name, icon, ... }

export async function login(username, password) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  const data = await parseJson(res, `Login failed (server returned ${res.status}). This is not necessarily a wrong password — check that the API is reachable.`)
  setToken(data.token)
  return data.identity
}

export async function logout() {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' })
  } finally {
    setToken(null)
  }
}

// Call once at app startup to restore a session after a page refresh.
// Returns null if there's no session (or it's expired/invalid).
export async function getCurrentIdentity() {
  if (!getToken()) return null
  const res = await apiFetch('/api/auth/me')
  if (!res.ok) {
    setToken(null)
    return null
  }
  const data = await res.json()
  return data.identity
}

// Admin-only: registers a new club's login credentials in MongoDB and
// returns the identity fields the frontend needs to add it to the club list.
export async function createClubAccount({ name, description, category, icon, username, password }) {
  const res = await apiFetch('/api/auth/clubs', {
    method: 'POST',
    body: JSON.stringify({ name, description, category, icon, username, password }),
  })
  const data = await parseJson(res, 'Could not create club.')
  return data.club
}
