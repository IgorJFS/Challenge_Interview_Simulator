import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession, deleteSession } from '../services/api'

const JOB_ROLES = [
  'Backend Junior',
  'Backend Senior',
  'Frontend Junior',
  'Frontend Senior',
  'Fullstack Junior',
  'Fullstack Senior',
  'Game Dev Junior',
  'Game Dev Senior',
]

export default function InterviewerDashboard() {
  const [selectedRole, setSelectedRole] = useState(JOB_ROLES[0])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleCreateSession = async () => {
    setLoading(true)
    try {
      const response = await createSession(selectedRole)
      setSessionId(response.data.sessionId)
    } catch {
      alert('Erro ao criar sessão.')
    } finally {
      setLoading(false)
    }
  }

  const handleEndSession = async () => {
    if (!sessionId) return
    await deleteSession(sessionId)
    setSessionId(null)
  }

  const candidateLink = sessionId
    ? `${window.location.origin}/session/${sessionId}`
    : null

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-8">Interviewer Dashboard</h1>

      {!sessionId ? (
        <div className="bg-gray-900 rounded-xl p-6 max-w-md flex flex-col gap-4">
          <label className="text-sm text-gray-400">Job Role</label>
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="bg-gray-800 text-white rounded-lg px-4 py-2 outline-none"
          >
            {JOB_ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <button
            onClick={handleCreateSession}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? 'Generating challenge...' : 'Create Session'}
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl p-6 max-w-md flex flex-col gap-4">
          <p className="text-sm text-gray-400">Session created. Share this link with the candidate:</p>
          <div className="bg-gray-800 rounded-lg px-4 py-2 text-blue-400 text-sm break-all">
            {candidateLink}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(candidateLink!)}
            className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition text-sm"
          >
            Copy Link
          </button>
          <button
            onClick={handleEndSession}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
          >
            End Session
          </button>
        </div>
      )}
    </div>
  )
}