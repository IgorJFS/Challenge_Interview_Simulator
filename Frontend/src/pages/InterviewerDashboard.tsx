import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession, deleteSession, getSubmission, getMessages } from '../services/api'

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

interface Submission {
  candidateCode: string
  candidateExplanation: string
  submittedAt: string
}

interface ChatMessage {
  messageId: number
  senderName: string
  messageContent: string
  isFromCandidate: boolean
  sentAt: string
}

export default function InterviewerDashboard() {
  const [selectedRole, setSelectedRole] = useState(JOB_ROLES[0])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!sessionId) return

    const interval = setInterval(async () => {
      try {
        const subRes = await getSubmission(sessionId)
        setSubmission(subRes.data)
      } catch {}

      try {
        const msgRes = await getMessages(sessionId)
        setMessages(msgRes.data.filter((m: ChatMessage) => m.isFromCandidate))
      } catch {}
    }, 3000)

    return () => clearInterval(interval)
  }, [sessionId])

  const handleCreateSession = async () => {
    setLoading(true)
    try {
      const response = await createSession(selectedRole)
      setSessionId(response.data.sessionId)
    } catch {
      alert('Error creating session.')
    } finally {
      setLoading(false)
    }
  }

  const handleEndSession = async () => {
    if (!sessionId) return
    await deleteSession(sessionId)
    setSessionId(null)
    setSubmission(null)
    setMessages([])
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
        <div className="flex flex-col gap-6 max-w-2xl">
          <div className="bg-gray-900 rounded-xl p-6 flex flex-col gap-4">
            <p className="text-sm text-gray-400">Candidate link:</p>
            <div className="bg-gray-800 rounded-lg px-4 py-2 text-blue-400 text-sm break-all">
              {candidateLink}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(candidateLink!)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition text-sm"
              >
                Copy Link
              </button>
              <button
                onClick={handleEndSession}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
              >
                End Session
              </button>
            </div>
          </div>

          {submission && (
            <div className="bg-gray-900 rounded-xl p-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-green-400">Stage 1 Submission</h2>
              <div>
                <p className="text-xs text-gray-500 mb-1">Submitted code:</p>
                <pre className="bg-gray-800 rounded-lg p-3 text-sm text-gray-200 overflow-x-auto">
                  {submission.candidateCode}
                </pre>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Explanation:</p>
                <p className="bg-gray-800 rounded-lg p-3 text-sm text-gray-200">
                  {submission.candidateExplanation}
                </p>
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-6 flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-yellow-400">Stage 2 Messages</h2>
              {messages.map(msg => (
                <div key={msg.messageId} className="bg-gray-800 rounded-lg px-4 py-3 text-sm text-gray-200">
                  <span className="text-blue-400 font-semibold mr-2">{msg.senderName}:</span>
                  {msg.messageContent}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}