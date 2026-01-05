import { http } from './http'

export async function login({ email, password }) {
  const res = await http.post('/api/auth/login', { email, password })
  return res.data
}

export async function register({ email, password, firstName, lastName }) {
  const res = await http.post('/api/auth/register', { email, password, firstName, lastName })
  return res.data
}

export async function forgotPassword({ email }) {
  const res = await http.post('/api/auth/forgot-password', { email })
  return res.data
}

export async function resetPassword({ token, newPassword }) {
  const res = await http.post('/api/auth/reset-password', { token, newPassword })
  return res.data
}


