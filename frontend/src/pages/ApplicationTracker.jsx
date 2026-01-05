import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../api/errors'
import { createApplication, listApplicationsByUser, updateApplication } from '../api/applications'
import { createResumeVersion, downloadResumeVersion, getResumeVersion } from '../api/resumes'
import { downloadTextBlob } from '../utils/download'
import Spinner from '../components/common/Spinner'
import { STATUS_BADGE_CLASSES, STATUS_LABELS, STATUS_OPTIONS } from '../constants/applicationStatus'

const ApplicationTracker = () => {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [savingStatusId, setSavingStatusId] = useState(null)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [resumeLoading, setResumeLoading] = useState(false)
  const [resumeSaving, setResumeSaving] = useState(false)
  const [resumeDownloadLoading, setResumeDownloadLoading] = useState(false)
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    jobUrl: '',
    status: 'APPLIED',
    notes: ''
  })

  useEffect(() => {
    if (user) {
      fetchApplications()
    }
  }, [user])

  const fetchApplications = async () => {
    try {
      setError('')
      const data = await listApplicationsByUser(user.userId)
      setApplications(data)
    } catch (error) {
      setError(getApiErrorMessage(error, 'Failed to fetch applications'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError('')
      await createApplication({
        ...formData,
        userId: user.userId
      })
      setShowForm(false)
      setFormData({
        jobTitle: '',
        companyName: '',
        jobUrl: '',
        status: 'APPLIED',
        notes: ''
      })
      fetchApplications()
    } catch (error) {
      setError(getApiErrorMessage(error, 'Failed to create application'))
    }
  }

  const getStatusColor = (status) => STATUS_BADGE_CLASSES[status] || STATUS_BADGE_CLASSES.APPLIED

  const handleStatusChange = async (applicationId, nextStatus) => {
    // Optimistic UI update
    // Snapshot current state for safe rollback (avoid sharing references)
    const previous = applications.map((a) => ({ ...a }))
    setApplications((apps) =>
      apps.map((a) => (a.id === applicationId ? { ...a, status: nextStatus } : a))
    )

    setSavingStatusId(applicationId)
    try {
      await updateApplication(applicationId, { status: nextStatus })
    } catch (error) {
      setApplications(previous)
      setError(getApiErrorMessage(error, 'Failed to update status'))
    } finally {
      setSavingStatusId(null)
    }
  }

  const openJobModal = async (app) => {
    setSelectedApplication(app)
    setResumeText('')

    if (!app?.resumeVersionId) return

    setResumeLoading(true)
    try {
      const data = await getResumeVersion(app.resumeVersionId)
      setResumeText(data?.resumeContent || '')
    } catch (error) {
      setError(getApiErrorMessage(error, 'Failed to load resume version'))
    } finally {
      setResumeLoading(false)
    }
  }

  const closeJobModal = () => {
    setSelectedApplication(null)
    setResumeText('')
    setResumeLoading(false)
    setResumeSaving(false)
    setResumeDownloadLoading(false)
  }

  const downloadAppliedResume = async () => {
    if (!selectedApplication?.resumeVersionId) return

    setResumeDownloadLoading(true)
    try {
      const id = selectedApplication.resumeVersionId
      const blobData = await downloadResumeVersion(id)
      const blob = new Blob([blobData], { type: 'text/plain;charset=utf-8' })
      downloadTextBlob(blob, `resume-${id}.txt`)
    } catch (error) {
      setError(getApiErrorMessage(error, 'Failed to download resume'))
    } finally {
      setResumeDownloadLoading(false)
    }
  }

  const attachResumeToApplication = async () => {
    if (!selectedApplication?.id) return
    if (!resumeText.trim()) {
      alert('Please paste the applied resume content first')
      return
    }

    setResumeSaving(true)
    try {
      // 1) Create resume version row
      const created = await createResumeVersion({
        userId: user.userId,
        jobApplicationId: selectedApplication.id,
        resumeContent: resumeText
      })

      const resumeVersionId = created?.id
      if (!resumeVersionId) {
        throw new Error('Resume version id missing from response')
      }

      // 2) Attach resumeVersionId to application
      await updateApplication(selectedApplication.id, { resumeVersionId })

      // Update local state to reflect attachment
      setSelectedApplication((prev) => (prev ? { ...prev, resumeVersionId } : prev))
      setApplications((apps) =>
        apps.map((a) => (a.id === selectedApplication.id ? { ...a, resumeVersionId } : a))
      )

    } catch (error) {
      setError(getApiErrorMessage(error, 'Failed to attach resume'))
    } finally {
      setResumeSaving(false)
    }
  }

  if (loading) {
    return <Spinner label="Loading applications..." />
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Job Applications</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Application'}
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {showForm && (
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                <input
                  type="text"
                  required
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Job URL</label>
                <input
                  type="url"
                  value={formData.jobUrl}
                  onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="APPLIED">Applied</option>
                  <option value="SCREENING">Assessment</option>
                  <option value="INTERVIEW">Interview Scheduled</option>
                  <option value="INTERVIEW_DONE">Interview Done</option>
                  <option value="OFFER">Offered</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Application
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {applications.length === 0 ? (
            <li className="px-4 py-5 text-center text-gray-500">No applications yet</li>
          ) : (
            applications.map((app) => (
              <li key={app.id} className="px-4 py-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{app.jobTitle}</h4>
                    <p className="text-sm text-gray-500">{app.companyName}</p>
                    {app.jobUrl && (
                      <button
                        type="button"
                        onClick={() => openJobModal(app)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Job
                      </button>
                    )}
                  </div>
                  <select
                    value={app.status}
                    disabled={savingStatusId === app.id}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)} border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                    aria-label="Change application status"
                    title="Change application status"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                {app.notes && (
                  <p className="mt-2 text-sm text-gray-600">{app.notes}</p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  Applied: {new Date(app.appliedDate).toLocaleDateString()}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>

      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeJobModal}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedApplication.jobTitle}
                </h3>
                <p className="text-sm text-gray-500">{selectedApplication.companyName}</p>
              </div>
              <button
                type="button"
                onClick={closeJobModal}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedApplication.status)}`}>
                  {STATUS_LABELS[selectedApplication.status] || selectedApplication.status}
                </span>
                {selectedApplication.appliedDate && (
                  <span className="text-xs text-gray-500">
                    Applied: {new Date(selectedApplication.appliedDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {selectedApplication.notes && (
                <div>
                  <div className="text-sm font-medium text-gray-700">Notes</div>
                  <div className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                    {selectedApplication.notes}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {selectedApplication.jobUrl && (
                  <a
                    href={selectedApplication.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Open job portal
                  </a>
                )}

                <button
                  type="button"
                  disabled={!selectedApplication.resumeVersionId || resumeDownloadLoading}
                  onClick={downloadAppliedResume}
                  className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {resumeDownloadLoading ? 'Downloading...' : 'Download applied resume'}
                </button>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Applied resume</div>
                {resumeLoading ? (
                  <div className="text-sm text-gray-500">Loading resume...</div>
                ) : (
                  <textarea
                    rows={10}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder={
                      selectedApplication.resumeVersionId
                        ? 'Resume content...'
                        : 'No resume attached yet. Paste the applied resume here to attach it.'
                    }
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                )}

                <div className="mt-2 flex justify-end gap-2">
                  {!selectedApplication.resumeVersionId && (
                    <button
                      type="button"
                      disabled={resumeSaving || resumeLoading}
                      onClick={attachResumeToApplication}
                      className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {resumeSaving ? 'Saving...' : 'Attach resume'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={closeJobModal}
                className="px-3 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplicationTracker

