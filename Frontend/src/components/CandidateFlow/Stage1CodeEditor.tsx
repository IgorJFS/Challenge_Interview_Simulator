import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { submitSolution } from '../../services/api'

const TIMER_SECONDS = 10 * 60

const getFileExtension = (lang?: string) => {
  if (!lang) return 'js';
  switch (lang.toLowerCase()) {
    case 'python': return 'py';
    case 'csharp': return 'cs';
    case 'typescript': return 'ts';
    case 'java': return 'java';
    case 'go': return 'go';
    default: return 'js';
  }
}

interface Session {
  sessionId: string
  jobRole: string
  buggyCode: string
  language?: string
}

interface Props {
  session: Session
  onTimeUp: () => void
  onSubmit: () => void
}

export default function Stage1CodeEditor({ session, onTimeUp, onSubmit }: Props) {
  const [code, setCode] = useState(() => {
    return localStorage.getItem(`session_code_${session.sessionId}`) || session.buggyCode
  })
  const [explanation, setExplanation] = useState(() => {
    return localStorage.getItem(`session_explanation_${session.sessionId}`) || ''
  })
  const submitted = useRef(false)

  // Load or initialize countdown timer using localStorage to survive browser refreshes
  const getInitialTime = () => {
    const stageKey = `stage1_timer_end_${session.sessionId}`
    const savedEndTime = localStorage.getItem(stageKey)
    if (savedEndTime) {
      const remaining = Math.max(0, Math.floor((parseInt(savedEndTime, 10) - Date.now()) / 1000))
      return remaining
    } else {
      const endTime = Date.now() + TIMER_SECONDS * 1000
      localStorage.setItem(stageKey, endTime.toString())
      return TIMER_SECONDS
    }
  }

  const [timeLeft, setTimeLeft] = useState(getInitialTime)

  useEffect(() => {
    const stageKey = `stage1_timer_end_${session.sessionId}`
    
    const interval = setInterval(() => {
      const savedEndTime = localStorage.getItem(stageKey)
      if (savedEndTime) {
        const remaining = Math.max(0, Math.floor((parseInt(savedEndTime, 10) - Date.now()) / 1000))
        setTimeLeft(remaining)
        
        if (remaining <= 0) {
          clearInterval(interval)
          if (!submitted.current) onTimeUp()
        }
      } else {
        // Fallback if localStorage was cleared
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            if (!submitted.current) onTimeUp()
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [session.sessionId, onTimeUp])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleSubmit = async () => {
    if (!code.trim() || !explanation.trim()) {
      return alert('Please fill in both the corrected code and the technical explanation before submitting.')
    }
    setSubmitting(true)
    try {
      await submitSolution(session.sessionId, code, explanation)
      submitted.current = true
      onSubmit()
    } catch {
      alert('Error submitting solution. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const [submitting, setSubmitting] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-[#0d0e12] text-white overflow-hidden font-sans relative">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

      {/* Main Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-white/5 relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Candidate Environment</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs font-medium">Coding Challenge:</span>
              <span className="text-white text-xs font-bold bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                {session.jobRole}
              </span>
            </div>
          </div>
        </div>

        {/* Live Timer Countdown Badge */}
        <div className={`flex items-center gap-3.5 px-6 py-2.5 rounded-2xl border transition-all duration-300 shadow-sm ${
          timeLeft < 60 
            ? 'bg-rose-950/40 border-rose-500/30 text-rose-400 shadow-rose-950/20 animate-pulse' 
            : 'bg-slate-900/60 border-white/5 text-emerald-400 shadow-slate-950/10'
        }`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-lg font-mono font-extrabold tracking-tight">
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`relative overflow-hidden rounded-xl px-5 py-2.5 font-bold text-sm tracking-wider transition-all duration-300 shadow-md ${
            submitting
              ? 'bg-slate-800 border border-white/5 text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-indigo-950/30 hover:scale-[1.01] active:scale-[0.99] border-t border-white/10 cursor-pointer'
          }`}
        >
          {submitting ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Submitting...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Submit Solution</span>
            </div>
          )}
        </button>
      </header>

      {/* Main Workspace Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* Monaco Editor Container */}
        <div className="flex-1 flex flex-col bg-slate-950/40 relative overflow-hidden">
          {/* File bar tabs mimicking real IDE */}
          <div className="bg-[#14161d] border-b border-white/5 flex items-center px-4">
            <div className="bg-[#1e222b] border-t-2 border-indigo-500 px-4 py-2.5 text-xs font-mono font-medium text-slate-200 flex items-center gap-2 border-r border-slate-950/80 shadow-md">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
              <span>challenge.{getFileExtension(session.language)}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500/60 ml-1.5" />
            </div>
            
            <div className="flex-1" />
            <span className="text-[10px] text-slate-500 font-mono select-none">READ / WRITE MODE</span>
          </div>

          <div className="flex-1 p-2 bg-[#1e1e24]/40 border-r border-white/5">
            <div className="h-full rounded-2xl overflow-hidden border border-white/5 shadow-inner">
              <Editor
                height="100%"
                language={session.language ? session.language.toLowerCase() : "javascript"}
                value={code}
                onChange={value => {
                  const val = value ?? ''
                  setCode(val)
                  localStorage.setItem(`session_code_${session.sessionId}`, val)
                }}
                theme="vs-dark"
                options={{ 
                  fontSize: 14.5, 
                  minimap: { enabled: false },
                  fontFamily: "Fira Code, Consolas, Monaco, monospace",
                  lineHeight: 22,
                  scrollbar: {
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10
                  },
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on"
                }}
              />
            </div>
          </div>
        </div>

        {/* Right side instruction and explanation panel */}
        <div className="w-[420px] bg-slate-950/60 border-l border-white/5 backdrop-blur-md flex flex-col p-6 gap-5 overflow-y-auto">
          
          {/* Permanent Warning Banner */}
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex gap-3 text-amber-300">
            <span className="shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <div className="flex flex-col gap-1 select-text">
              <span className="text-[11px] font-bold tracking-wider uppercase">Important Notice</span>
              <p className="text-[11px] leading-relaxed text-amber-350/90 font-medium">
                If you are unsure how to correct the code bug, <strong>you can still submit your solution</strong>! However, you must at least explain your thoughts on what the bug is in the Technical Explanation area below.
              </p>
            </div>
          </div>

          {/* Objective glassmorphic block */}
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.467L19.38 18.23a1.792 1.792 0 002.167-2.168L19.53 10.9m-9.717 5.004L3 21l4.467-8.904L5.23 10.07a1.792 1.792 0 012.168-2.167L13.1 9.98" />
                </svg>
              </span>
              <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">Challenge Objective</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Carefully analyze the {session.language || 'JavaScript'} code on the left. There is an intentional logical bug that prevents its ideal execution.
            </p>
            <ul className="mt-3 space-y-2 text-[11px] text-slate-400 font-medium">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>Find the hidden bug and correct it directly inside the code editor.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>Explain the technical error and how your code modification resolves the problem.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>If the time runs out, you will proceed to the next stage of team communication.</span>
              </li>
            </ul>
          </div>

          {/* Explanation Textarea Form Panel */}
          <div className="flex-1 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Technical Explanation
              </label>
              <span className="text-[10px] text-slate-600 font-mono">MD SUPPORTED</span>
            </div>
            
            <textarea
              value={explanation}
              onChange={e => {
                setExplanation(e.target.value)
                localStorage.setItem(`session_explanation_${session.sessionId}`, e.target.value)
              }}
              placeholder="Describe here concisely:
1. What was the bug?
2. Why did it happen?
3. How did your code change solve the problem?"
              className="flex-1 w-full bg-slate-950/70 text-slate-250 border border-white/5 rounded-2xl p-4 text-xs font-mono leading-relaxed outline-none resize-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition duration-300 shadow-inner"
            />
          </div>

          {/* Footer Guidelines */}
          <div className="flex items-center gap-2.5 bg-slate-900/30 border border-white/5 px-4 py-3 rounded-xl">
            <span className="text-amber-500 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <span className="text-[10px] text-slate-500 font-medium leading-normal">
              Avoid submitting broken code. Use the technical explanation to demonstrate your logical reasoning.
            </span>
          </div>

        </div>

      </div>
    </div>
  )
}