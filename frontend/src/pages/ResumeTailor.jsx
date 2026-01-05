import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { tailorResume } from '../api/resumes'
import { getApiErrorMessage } from '../api/errors'

const ResumeTailor = () => {
  const { user } = useAuth()
  const [jobDescription, setJobDescription] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description')
      return
    }

    setLoading(true)
    try {
      setError('')
      const data = await tailorResume({
        userId: user.userId,
        jobDescription,
        jobTitle,
        companyName
      })
      setResult(data)
    } catch (error) {
      setError(getApiErrorMessage(error, 'Failed to tailor resume'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Resume Tailor</h3>
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Software Engineer"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Tech Corp"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Description</label>
              <textarea
                rows={10}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleTailor}
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Tailoring Resume...' : 'Tailor Resume'}
            </button>
          </div>

          {result && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Tailored Resume</h4>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">ATS Score:</span> {result.atsScore}/100
                </div>
                {result.atsFeedback && (
                  <div>
                    <span className="font-medium">ATS Feedback:</span> {result.atsFeedback}
                  </div>
                )}
                {result.tailoredResume && (
                  <div>
                    <span className="font-medium">Tailored Resume:</span>
                    <pre className="mt-2 p-4 bg-gray-50 rounded-md whitespace-pre-wrap text-sm">
                      {result.tailoredResume}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResumeTailor

