import { http } from './http'

export async function listApplicationsByUser(userId) {
  const res = await http.get(`/api/applications/user/${userId}`)
  return res.data
}

export async function createApplication(payload) {
  const res = await http.post('/api/applications', payload)
  return res.data
}

export async function updateApplication(id, patch) {
  const res = await http.put(`/api/applications/${id}`, patch)
  return res.data
}


