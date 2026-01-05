export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  if (!error) return fallback

  const data = error.response?.data

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message
  }

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (typeof error.message === 'string' && error.message.trim()) {
    // Axios uses "Network Error" sometimes; we normalize a common dev-friendly message.
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return 'Cannot connect to server. Is the backend running?'
    }
    return error.message
  }

  return fallback
}


