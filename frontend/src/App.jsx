import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import JobAnalyzer from './pages/JobAnalyzer'
import ResumeTailor from './pages/ResumeTailor'
import ApplicationTracker from './pages/ApplicationTracker'
import Layout from './components/common/Layout'

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/profile" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="job-analyzer" element={<JobAnalyzer />} />
            <Route path="resume-tailor" element={<ResumeTailor />} />
            <Route path="applications" element={<ApplicationTracker />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

