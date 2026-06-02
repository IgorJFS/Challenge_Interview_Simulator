import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getSession } from '../services/api'
import Stage1CodeEditor from '../components/CandidateFlow/Stage1CodeEditor'
import Stage2Workspace from '../components/CandidateFlow/Stage2Workspace'

interface Session {
  sessionId: string
  jobRole: string
  buggyCode: string
  isActive: boolean
  createdAt: string
}

export default function CandidateSession() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [session, setSession] = useState<Session | null>(null)
  const [stage, setStage] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await getSession(sessionId!)
        setSession(response.data)
      } catch {
        alert('Session not found.')
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [sessionId])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
      Loading session...
    </div>
  )

  if (!session) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
      Session not found.
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {stage === 1
        ? <Stage1CodeEditor session={session} onTimeUp={() => setStage(2)} onSubmit={() => setStage(2)} />
        : <Stage2Workspace sessionId={session.sessionId} />
      }
    </div>
  )
}