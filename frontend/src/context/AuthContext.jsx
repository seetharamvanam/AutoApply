import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // TODO: Verify token and fetch user info
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
    setLoading(false)
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { token, userId, email: userEmail } = response.data
      localStorage.setItem('token', token)
      setToken(token)
      setUser({ userId, email: userEmail })
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message 
        || error.message 
        || (error.code === 'ERR_NETWORK' ? 'Cannot connect to server. Is the backend running?' : 'Login failed')
      return { success: false, error: errorMessage }
    }
  }

  const register = async (email, password, firstName, lastName) => {
    try {
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        firstName,
        lastName
      })
      const { token, userId, email: userEmail } = response.data
      localStorage.setItem('token', token)
      setToken(token)
      setUser({ userId, email: userEmail })
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.message 
        || error.message 
        || (error.code === 'ERR_NETWORK' ? 'Cannot connect to server. Is the backend running?' : 'Registration failed')
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('/api/auth/forgot-password', { email })
      return { success: true, message: response.data.message }
    } catch (error) {
      console.error('Forgot password error:', error)
      const errorMessage = error.response?.data?.message 
        || error.message 
        || (error.code === 'ERR_NETWORK' ? 'Cannot connect to server. Is the backend running?' : 'Failed to send reset email')
      return { success: false, error: errorMessage }
    }
  }

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await axios.post('/api/auth/reset-password', { 
        token, 
        newPassword 
      })
      return { success: true, message: response.data.message }
    } catch (error) {
      console.error('Reset password error:', error)
      const errorMessage = error.response?.data?.message 
        || error.message 
        || (error.code === 'ERR_NETWORK' ? 'Cannot connect to server. Is the backend running?' : 'Failed to reset password')
      return { success: false, error: errorMessage }
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

