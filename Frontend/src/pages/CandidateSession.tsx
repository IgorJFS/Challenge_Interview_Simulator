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
  language?: string
  stage1StartedAt?: string
}

export default function CandidateSession() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [session, setSession] = useState<Session | null>(null)
  
  // Persist active stage in localStorage to survive browser refreshes
  const getInitialStage = (): 1 | 2 => {
    const saved = localStorage.getItem(`session_stage_${sessionId}`)
    return saved === '2' ? 2 : 1
  }

  const [stage, setStage] = useState<1 | 2>(getInitialStage)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await getSession(sessionId!, true)
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

  const handleTransitionToStage2 = () => {
    localStorage.setItem(`session_stage_${session.sessionId}`, '2')
    setStage(2)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {stage === 1
        ? <Stage1CodeEditor session={session} onTimeUp={handleTransitionToStage2} onSubmit={handleTransitionToStage2} />
        : <Stage2Workspace sessionId={session.sessionId} />
      }
    </div>
  )
}