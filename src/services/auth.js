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

// Public self-service signup for regular accounts. Logs the new account in
// immediately (same as login) and returns its identity.
export async function signup(email, dob, password) {
  const res = await apiFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, dob, password }),
  })
  const data = await parseJson(res, 'Could not create account.')
  setToken(data.token)
  return data.identity
}

// Forgot password, step 1: check the email + date of birth match a "user"
// account before letting the frontend show the "new password" field.
export async function verifyDob(email, dob) {
  const res = await apiFetch('/api/auth/forgot-password/verify', {
    method: 'POST',
    body: JSON.stringify({ email, dob }),
  })
  await parseJson(res, 'Email and date of birth do not match our records.')
  return true
}

// Forgot password, step 2: actually changes the password. The server
// re-checks email + DOB itself — this call can't succeed just because step
// 1 did.
export async function resetPassword(email, dob, newPassword) {
  const res = await apiFetch('/api/auth/forgot-password/reset', {
    method: 'POST',
    body: JSON.stringify({ email, dob, newPassword }),
  })
  await parseJson(res, 'Could not reset password.')
  return true
}

// Admin-only: list self-service student accounts for the Admin Panel.
export async function getStudents() {
  const res = await apiFetch('/api/auth/students')
  const data = await parseJson(res, 'Could not load student accounts.')
  return data.students
}
