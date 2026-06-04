import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import InterviewerLogin from './pages/InterviewerLogin'
import InterviewerDashboard from './pages/InterviewerDashboard'
import CandidateSession from './pages/CandidateSession'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = localStorage.getItem('interviewer-auth') === 'true'
  return isAuth ? <>{children}</> : <Navigate to="/" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InterviewerLogin />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <InterviewerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/session/:sessionId" element={<CandidateSession />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App