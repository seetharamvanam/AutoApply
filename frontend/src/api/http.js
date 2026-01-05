import axios from 'axios'
import { getToken } from '../utils/storage'

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || ''

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


