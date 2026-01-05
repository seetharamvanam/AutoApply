export const STATUS_OPTIONS = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SCREENING', label: 'Assessment' },
  { value: 'INTERVIEW', label: 'Interview Scheduled' },
  { value: 'INTERVIEW_DONE', label: 'Interview Done' },
  { value: 'OFFER', label: 'Offered' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WITHDRAWN', label: 'Withdrawn' }
]

export const STATUS_LABELS = STATUS_OPTIONS.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {})

export const STATUS_BADGE_CLASSES = {
  APPLIED: 'bg-blue-100 text-blue-800',
  SCREENING: 'bg-yellow-100 text-yellow-800',
  INTERVIEW: 'bg-purple-100 text-purple-800',
  INTERVIEW_DONE: 'bg-indigo-100 text-indigo-800',
  OFFER: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-gray-100 text-gray-800'
}


