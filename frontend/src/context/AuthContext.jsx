import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth'
import { getApiErrorMessage } from '../api/errors'
import { parseJwtPayload } from '../utils/jwt'
import { clearToken, getToken as getStoredToken, setToken as setStoredToken } from '../utils/storage'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const deriveUserFromToken = (jwtToken) => {
    if (!jwtToken) return null
    const payload = parseJwtPayload(jwtToken)
    if (!payload?.userId) return null
    return {
      userId: payload.userId,
      email: payload.email || payload.sub
    }
  }

  const [token, setTokenState] = useState(() => getStoredToken())
  const [user, setUser] = useState(() => deriveUserFromToken(getStoredToken()))
  const [loading, setLoading] = useState(false)

  // Keep user in sync with token. If token becomes invalid/expired, clear it.
  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    const nextUser = deriveUserFromToken(token)
    if (!nextUser) {
      clearToken()
      setTokenState(null)
      setUser(null)
      return
    }

    setUser(nextUser)
  }, [token])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await authApi.login({ email, password })
      setStoredToken(data.token)
      setTokenState(data.token)
      setUser({ userId: data.userId, email: data.email })
      return { success: true }
    } catch (error) {
      return { success: false, error: getApiErrorMessage(error, 'Login failed') }
    } finally {
      setLoading(false)
    }
  }

  const register = async (email, password, firstName, lastName) => {
    setLoading(true)
    try {
      const data = await authApi.register({ email, password, firstName, lastName })
      setStoredToken(data.token)
      setTokenState(data.token)
      setUser({ userId: data.userId, email: data.email })
      return { success: true }
    } catch (error) {
      return { success: false, error: getApiErrorMessage(error, 'Registration failed') }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    clearToken()
    setTokenState(null)
    setUser(null)
  }

  const forgotPassword = async (email) => {
    try {
      const data = await authApi.forgotPassword({ email })
      return { success: true, message: data.message }
    } catch (error) {
      return { success: false, error: getApiErrorMessage(error, 'Failed to send reset email') }
    }
  }

  const resetPassword = async (token, newPassword) => {
    try {
      const data = await authApi.resetPassword({ token, newPassword })
      return { success: true, message: data.message }
    } catch (error) {
      return { success: false, error: getApiErrorMessage(error, 'Failed to reset password') }
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

