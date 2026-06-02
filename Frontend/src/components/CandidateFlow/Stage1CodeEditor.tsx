import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { submitSolution } from '../../services/api'

const TIMER_SECONDS = 15 * 60

interface Session {
  sessionId: string
  jobRole: string
  buggyCode: string
}

interface Props {
  session: Session
  onTimeUp: () => void
  onSubmit: () => void
}

export default function Stage1CodeEditor({ session, onTimeUp, onSubmit }: Props) {
  const [code, setCode] = useState(session.buggyCode)
  const [explanation, setExplanation] = useState('')
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [submitting, setSubmitting] = useState(false)
  const submitted = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          if (!submitted.current) onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleSubmit = async () => {
    if (!code || !explanation) return alert('Fill in both the code and the explanation.')
    setSubmitting(true)
    try {
      await submitSolution(session.sessionId, code, explanation)
      submitted.current = true
      onSubmit()
    } catch {
      alert('Error submitting solution.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
        <div>
          <span className="text-gray-400 text-sm">Role: </span>
          <span className="text-white text-sm font-semibold">{session.jobRole}</span>
        </div>
        <div className={`text-lg font-mono font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-green-400'}`}>
          {formatTime(timeLeft)}
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          {submitting ? 'Submitting...' : 'Submit Solution'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 border-r border-gray-800">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={code}
            onChange={value => setCode(value ?? '')}
            theme="vs-dark"
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
        </div>

        <div className="w-96 flex flex-col p-4 gap-3">
          <p className="text-gray-400 text-sm">Find and fix the bug, then explain what was wrong and why it happened.</p>
          <textarea
            value={explanation}
            onChange={e => setExplanation(e.target.value)}
            placeholder="Explain the bug here..."
            className="flex-1 bg-gray-800 text-white rounded-lg p-3 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}