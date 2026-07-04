import { apiFetch, parseJson } from './api'

export async function fetchPosts() {
  const res = await apiFetch('/api/posts')
  const data = await parseJson(res, 'Could not load posts.')
  return data.posts
}

export async function createPost(payload) {
  const res = await apiFetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  const data = await parseJson(res, 'Could not submit post.')
  return data.post
}

export async function approvePost(id) {
  const res = await apiFetch(`/api/posts/${encodeURIComponent(id)}/approve`, { method: 'POST' })
  const data = await parseJson(res, 'Could not approve post.')
  return data.post
}

export async function rejectPost(id) {
  const res = await apiFetch(`/api/posts/${encodeURIComponent(id)}/reject`, { method: 'POST' })
  const data = await parseJson(res, 'Could not reject post.')
  return data
}

export async function deletePost(id) {
  const res = await apiFetch(`/api/posts/${encodeURIComponent(id)}/delete`, { method: 'POST' })
  const data = await parseJson(res, 'Could not delete post.')
  return data
}

export async function reactToPost(id, emoji) {
  const res = await apiFetch(`/api/posts/${encodeURIComponent(id)}/react`, {
    method: 'POST',
    body: JSON.stringify({ emoji }),
  })
  const data = await parseJson(res, 'Could not save reaction.')
  return data.post
}
