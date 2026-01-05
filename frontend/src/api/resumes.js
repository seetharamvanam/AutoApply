import { http } from './http'

export async function tailorResume({ userId, jobDescription, jobTitle, companyName }) {
  const res = await http.post('/api/resumes/tailor', { userId, jobDescription, jobTitle, companyName })
  return res.data
}

export async function createResumeVersion({ userId, jobApplicationId, resumeContent, atsScore, atsFeedback }) {
  const res = await http.post('/api/resume-versions', {
    userId,
    jobApplicationId,
    resumeContent,
    atsScore,
    atsFeedback
  })
  return res.data
}

export async function getResumeVersion(id) {
  const res = await http.get(`/api/resume-versions/${id}`)
  return res.data
}

export async function downloadResumeVersion(id) {
  const res = await http.get(`/api/resume-versions/${id}/download`, { responseType: 'blob' })
  return res.data
}


