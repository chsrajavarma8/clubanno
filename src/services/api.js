// Shared fetch helper used by auth.js, clubs.js, posts.js, and
// notifications.js — attaches the auth token (if any) and gives every
// service the same error handling for "backend unreachable".

// If VITE_API_URL isn't set, requests go to a relative path (same origin as
// the page). That's correct for a Vercel deployment where the frontend and
// the /api serverless functions live on the same domain. For local dev,
// where the frontend (Vite) and backend (Express in /server) run on
// different ports, set VITE_API_URL in your local .env instead.
const API_URL = import.meta.env.VITE_API_URL || ''
const TOKEN_KEY = 'communityhub.authToken'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error("Can't reach the server. Is it running?")
  }
  return res
}

// Parses a JSON response and throws a friendly Error if the request failed.
export async function parseJson(res, fallbackError) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || fallbackError)
  return data
}
