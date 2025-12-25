import { useState } from 'react'
import axios from 'axios'

const JobAnalyzer = () => {
  const [jobDescription, setJobDescription] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      alert('Please enter a job description')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/jobs/parse', {
        jobDescription,
        jobUrl
      })
      setResult(response.data)
    } catch (error) {
      alert('Failed to analyze job description')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Job Description Analyzer</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job URL (Optional)</label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://..."
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
              onClick={handleAnalyze}
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze Job Description'}
            </button>
          </div>

          {result && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Analysis Results</h4>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Title:</span> {result.title}
                </div>
                <div>
                  <span className="font-medium">Company:</span> {result.company}
                </div>
                <div>
                  <span className="font-medium">Location:</span> {result.location}
                </div>
                {result.requiredSkills && result.requiredSkills.length > 0 && (
                  <div>
                    <span className="font-medium">Required Skills:</span>
                    <ul className="list-disc list-inside ml-2">
                      {result.requiredSkills.map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                    </ul>
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

export default JobAnalyzer

