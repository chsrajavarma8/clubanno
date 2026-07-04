import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../lib/firebase'

function safeName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function uploadPoster(file, clubUid) {
  const path = `posters/${clubUid}/${Date.now()}-${safeName(file.name)}`
  const fileRef = ref(storage, path)
  await uploadBytes(fileRef, file, { contentType: file.type })
  const url = await getDownloadURL(fileRef)
  return { url, path }
}

export async function uploadEmoji(file, clubUid) {
  const path = `emojis/${clubUid}/${Date.now()}-${safeName(file.name)}`
  const fileRef = ref(storage, path)
  await uploadBytes(fileRef, file, { contentType: file.type })
  const url = await getDownloadURL(fileRef)
  return { url, path }
}
