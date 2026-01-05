import { http } from './http'

export async function getProfile(userId) {
  const res = await http.get(`/api/profile/${userId}`)
  return res.data
}

export async function upsertProfile(userId, profile) {
  const res = await http.post(`/api/profile/${userId}`, profile)
  return res.data
}


