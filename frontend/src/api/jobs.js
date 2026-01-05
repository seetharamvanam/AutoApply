import { http } from './http'

export async function parseJob({ jobDescription, jobUrl }) {
  const res = await http.post('/api/jobs/parse', { jobDescription, jobUrl })
  return res.data
}


