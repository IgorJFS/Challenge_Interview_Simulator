import { BrowserRouter, Routes, Route } from 'react-router-dom'
import InterviewerLogin from './pages/InterviewerLogin'
import InterviewerDashboard from './pages/InterviewerDashboard'
import CandidateSession from './pages/CandidateSession'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InterviewerLogin />} />
        <Route path="/dashboard" element={<InterviewerDashboard />} />
        <Route path="/session/:sessionId" element={<CandidateSession />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App