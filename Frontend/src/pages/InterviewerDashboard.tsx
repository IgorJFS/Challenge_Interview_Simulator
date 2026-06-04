import { useState, useEffect } from 'react'
import { createSession, deleteSession, getSubmission, getMessages, getSession } from '../services/api'

const JOB_ROLES = [
  { id: 'Backend Junior', name: 'Backend Junior', category: 'Backend', icon: 'server', color: '#ef4444' },
  { id: 'Backend Senior', name: 'Backend Senior', category: 'Backend', icon: 'server', color: '#ef4444' },
  { id: 'Frontend Junior', name: 'Frontend Junior', category: 'Frontend', icon: 'layout', color: '#06b6d4' },
  { id: 'Frontend Senior', name: 'Frontend Senior', category: 'Frontend', icon: 'layout', color: '#06b6d4' },
  { id: 'Fullstack Junior', name: 'Fullstack Junior', category: 'Fullstack', icon: 'layers', color: '#8b5cf6' },
  { id: 'Fullstack Senior', name: 'Fullstack Senior', category: 'Fullstack', icon: 'layers', color: '#8b5cf6' },
  { id: 'Game Dev Junior', name: 'Game Dev Junior', category: 'Game Dev', icon: 'gamepad', color: '#10b981' },
  { id: 'Game Dev Senior', name: 'Game Dev Senior', category: 'Game Dev', icon: 'gamepad', color: '#10b981' },
]

const LANGUAGES = [
  { id: 'JavaScript', name: 'JavaScript', extension: 'js', color: '#eab308' },
  { id: 'TypeScript', name: 'TypeScript', extension: 'ts', color: '#3b82f6' },
  { id: 'React', name: 'React', extension: 'jsx', color: '#61dafb' },
  { id: 'CSharp', name: 'C#', extension: 'cs', color: '#a855f7' },
  { id: 'Java', name: 'Java', extension: 'java', color: '#f97316' },
  { id: 'Go', name: 'Go', extension: 'go', color: '#06b6d4' },
  { id: 'Rust', name: 'Rust', extension: 'rs', color: '#ea580c' },
  { id: 'C', name: 'C', extension: 'c', color: '#a8b9cc' },
  { id: 'Cpp', name: 'C++', extension: 'cpp', color: '#f43f5e' },
  { id: 'Ruby', name: 'Ruby', extension: 'rb', color: '#ef4444' },
  { id: 'Php', name: 'PHP', extension: 'php', color: '#6366f1' },
  { id: 'Python', name: 'Python', extension: 'py', color: '#38bdf8' },
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
  const [selectedRole, setSelectedRole] = useState(JOB_ROLES[0].id)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(10 * 60)
  const [timerStage, setTimerStage] = useState<1 | 2>(1)
  const [fixedCode, setFixedCode] = useState('')
  const [bugExplanation, setBugExplanation] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].id)
  const [sessionLanguage, setSessionLanguage] = useState('JavaScript')
  const [stage1StartedAt, setStage1StartedAt] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const interval = setInterval(async () => {
      try {
        const subRes = await getSubmission(sessionId)
        setSubmission(subRes.data)
      } catch {}

      try {
        const sessionRes = await getSession(sessionId)
        if (sessionRes.data.stage1StartedAt) {
          setStage1StartedAt(sessionRes.data.stage1StartedAt)
        }
      } catch {}

      try {
        const msgRes = await getMessages(sessionId)
        setMessages(msgRes.data.filter((m: ChatMessage) => m.isFromCandidate))
        if (msgRes.data.some((m: ChatMessage) => m.messageContent.includes('Candidate completed the interview.'))) {
          setTimerStage(2)
          setTimeLeft(0)
        }
      } catch {}
    }, 3000)

    return () => clearInterval(interval)
  }, [sessionId])

  // Recruiter Dashboard timer countdown and stage 2 transition
  useEffect(() => {
    if (!sessionId) {
      setTimeLeft(10 * 60)
      setTimerStage(1)
      setStage1StartedAt(null)
      return
    }

    if (timerStage === 1) {
      if (!stage1StartedAt) {
        setTimeLeft(10 * 60)
        return
      }

      const timer = setInterval(() => {
        const startTime = new Date(stage1StartedAt.endsWith('Z') ? stage1StartedAt : stage1StartedAt + 'Z').getTime()
        const endTime = startTime + 10 * 60 * 1000
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
        setTimeLeft(remaining)

        if (remaining <= 0) {
          setTimerStage(2)
          setTimeLeft(10 * 60)
          clearInterval(timer)
        }
      }, 1000)

      return () => clearInterval(timer)
    } else {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [sessionId, stage1StartedAt, timerStage])

  // Transition stage 2 when candidate submits Stage 1 successfully
  useEffect(() => {
    if (submission && timerStage === 1) {
      setTimerStage(2)
      setTimeLeft(10 * 60)
    }
  }, [submission, timerStage])

  const handleCreateSession = async () => {
    setLoading(true)
    try {
      const response = await createSession(selectedRole, selectedLanguage)
      setSessionId(response.data.sessionId)
      setFixedCode(response.data.fixedCode || '')
      setBugExplanation(response.data.bugExplanation || '')
      setSessionLanguage(response.data.language || 'JavaScript')
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
    setTimerStage(1)
    setFixedCode('')
    setBugExplanation('')
    setSessionLanguage('JavaScript')
    setStage1StartedAt(null)
  }

  const handleCopyLink = () => {
    if (!candidateLink) return
    navigator.clipboard.writeText(candidateLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const getFileExtension = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'python': return 'py';
      case 'csharp': return 'cs';
      case 'typescript': return 'ts';
      case 'java': return 'java';
      case 'go': return 'go';
      case 'rust': return 'rs';
      case 'cpp': return 'cpp';
      case 'ruby': return 'rb';
      case 'php': return 'php';
      case 'react': return 'jsx';
      case 'c': return 'c';
      default: return 'js';
    }
  }

  const candidateLink = sessionId
    ? `${window.location.origin}/session/${sessionId}`
    : null

  // Icon selector helper
  const renderRoleIcon = (iconName: string) => {
    switch (iconName) {
      case 'server':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        )
      case 'layout':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
          </svg>
        )
      case 'layers':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )
      case 'gamepad':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="3" />
            <path d="M6 12h4" />
            <path d="M8 10v4" />
            <line x1="15" y1="13" x2="15.01" y2="13" strokeWidth={3} />
            <line x1="18" y1="11" x2="18.01" y2="11" strokeWidth={3} />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-zinc-950 text-white relative overflow-hidden flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />

      {/* Toast Notification for Link Copy */}
      <div
        className={`fixed top-6 right-6 z-50 transform transition-all duration-500 ease-out flex items-center gap-3 bg-slate-900/90 border border-emerald-500/30 text-emerald-400 px-5 py-3.5 rounded-xl shadow-2xl shadow-emerald-950/20 backdrop-blur-md ${
          copied ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0 pointer-events-none'
        }`}
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">Link Copied!</span>
          <span className="text-xs text-emerald-400/70">Send it to the candidate to start the session.</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-white/6 bg-slate-900/30 backdrop-blur-md relative z-10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-linear-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Interview Challenge Simulator
            </h1>
            <p className="text-xs text-indigo-400/80 font-medium tracking-wider uppercase">Interviewer Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800/40 border border-white/5 rounded-full px-4 py-1.5 text-xs text-slate-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Server Connection
          </div>
        </div>
      </header>

      {/* Main Dashboard Space */}
      <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto p-8 flex flex-col justify-center">
        {!sessionId ? (
          /* SESSION CREATION WORKFLOW */
          <div className="max-w-2xl w-full mx-auto bg-slate-900/45 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8 shadow-2xl shadow-slate-950/50 flex flex-col gap-6">
            <div className="flex flex-col gap-1.5 text-center mb-2">
              <h2 className="text-2xl font-bold bg-linear-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                Create Interview Session
              </h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Select a target job role. Our AI will craft an appropriate codebase with a sneaky bug tailored for this role.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">
                Select Job Role
              </label>
              
              <div className="grid grid-cols-2 gap-3.5">
                {JOB_ROLES.map(role => {
                  const isSelected = selectedRole === role.id
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      style={{
                        borderColor: isSelected ? role.color : undefined,
                        boxShadow: isSelected ? `0 4px 20px -2px ${role.color}25` : undefined,
                        background: isSelected ? `linear-gradient(to right, ${role.color}15, transparent)` : undefined,
                      }}
                      className={`flex items-center gap-3.5 px-5 py-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                        isSelected
                          ? 'text-white'
                          : 'bg-slate-800/20 border-white/4 text-slate-400 hover:bg-slate-800/45 hover:text-slate-200'
                      }`}
                    >
                      {!isSelected && (
                        <div 
                          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300"
                          style={{
                            background: `linear-gradient(to right, ${role.color}, transparent)`
                          }}
                        />
                      )}
                      
                      <div 
                        className="p-2.5 rounded-xl transition-all duration-300 relative z-10"
                        style={{
                          backgroundColor: isSelected ? `${role.color}25` : 'rgba(30, 41, 59, 0.6)',
                          color: isSelected ? role.color : '#94a3b8',
                        }}
                      >
                        {renderRoleIcon(role.icon)}
                      </div>

                      <div className="flex flex-col relative z-10">
                        <span 
                          className="text-[10px] font-bold tracking-wider uppercase"
                          style={{ color: role.color }}
                        >
                          {role.category}
                        </span>
                        <span className="font-bold text-sm tracking-tight transition-colors">
                          {role.name}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">
                Select Programming Language
              </label>
              
              <div className="grid grid-cols-3 gap-3">
                {LANGUAGES.map(lang => {
                  const isSelected = selectedLanguage === lang.id
                  return (
                    <button
                      key={lang.id}
                      onClick={() => setSelectedLanguage(lang.id)}
                      style={{
                        borderColor: isSelected ? lang.color : undefined,
                        boxShadow: isSelected ? `0 4px 20px -2px ${lang.color}25` : undefined,
                      }}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                        isSelected
                          ? 'text-white bg-slate-900/60'
                          : 'bg-slate-800/20 border-white/4 text-slate-400 hover:bg-slate-800/45 hover:text-slate-200'
                      }`}
                    >
                      {isSelected ? (
                        <div 
                          className="absolute inset-0 pointer-events-none opacity-[0.08]"
                          style={{
                            backgroundColor: lang.color
                          }}
                        />
                      ) : (
                        <div 
                          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300"
                          style={{
                            backgroundColor: lang.color
                          }}
                        />
                      )}
                      <span className="font-bold text-sm tracking-tight relative z-10 transition-colors duration-300" style={{ color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                        {lang.name}
                      </span>
                      <span 
                        className="text-[10px] font-bold font-mono px-2 py-0.5 rounded border uppercase transition-colors duration-300 relative z-10"
                        style={{
                          color: lang.color,
                          borderColor: `${lang.color}35`,
                          backgroundColor: `${lang.color}12`
                        }}
                      >
                        .{lang.extension}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={handleCreateSession}
              disabled={loading}
              className={`w-full relative mt-4 overflow-hidden rounded-2xl py-4 font-bold text-sm tracking-wider uppercase transition-all duration-300 shadow-xl ${
                loading
                  ? 'bg-slate-800 border border-white/6 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-950/40 hover:shadow-indigo-500/10 hover:scale-[1.01] active:scale-[0.99] border-t border-white/20'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Generating Challenge Snippet...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Live Session</span>
                </div>
              )}
            </button>
          </div>
        ) : (
          /* ACTIVE INTERVIEW MONITOR PANEL */
          <div className="grid grid-cols-3 gap-8 items-start w-full">
            {timerStage === 2 && timeLeft === 0 && (
              <div className="col-span-3 bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/25 rounded-3xl p-6 shadow-xl shadow-slate-950/20 flex items-start gap-4 mb-2 relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Test Status</span>
                    <span className="text-xs text-slate-500 font-medium font-mono">• Completed</span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    🎉 Candidate Has Successfully Completed the Interview Challenge!
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-3xl mt-0.5">
                    The 2-stage technical interview simulator has concluded successfully. You can now analyze their final submitted code solution, technical explanation, and review their communication chat logs below. Click <strong>"End Session"</strong> in the sidebar to permanently purge all data when finished.
                  </p>
                </div>
              </div>
            )}
            
            {/* SIDEBAR: CONTROL & TIMER */}
            <div className="col-span-1 flex flex-col gap-6">
              
              {/* LIVE TIMER CARD */}
              <div className="bg-slate-900/45 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6 shadow-xl shadow-slate-950/20 relative overflow-hidden flex flex-col items-center text-center">
                {/* Background glow behind timer */}
                <div className={`absolute top-0 inset-x-0 h-1 transition-colors duration-1000 ${
                  timeLeft < 60 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                }`} />
 
                <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-2">
                  Session Timer
                </span>
 
                {/* Circular Style Timer View */}
                <div className="relative my-4 flex items-center justify-center">
                  <div className={`text-4xl font-mono font-extrabold tracking-tight transition-all duration-300 ${
                    timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                  }`}>
                    {formatTime(timeLeft)}
                  </div>
                </div>
 
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-white/4 text-xs font-medium text-slate-300 mb-1">
                  <span className={`w-2 h-2 rounded-full ${
                    timeLeft === 0 && timerStage === 2 
                      ? 'bg-slate-500' 
                      : !stage1StartedAt && timerStage === 1
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-emerald-500 animate-pulse'
                  }`} />
                  {timeLeft === 0 && timerStage === 2 
                    ? 'Test Concluded' 
                    : timerStage === 2 
                      ? 'Stage 2: Live Chat' 
                      : !stage1StartedAt 
                        ? 'Awaiting Candidate' 
                        : 'Stage 1: Code Challenge'}
                </div>

                <div className="mt-4 pt-4 border-t border-white/4 w-full text-center">
                  <span className="text-xs text-slate-500 block mb-1">Role Under Test</span>
                  <span className="text-sm font-bold text-indigo-300">{selectedRole}</span>
                </div>
              </div>

              {/* SHAREABLE LINK CARD */}
              <div className="bg-slate-900/45 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6 shadow-xl shadow-slate-950/20 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase">
                    Candidate Invite Link
                  </span>
                  <p className="text-xs text-slate-500">
                    Share this unique live session link with the candidate to let them start the challenge.
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-3 relative group">
                  <span className="text-xs text-indigo-400 font-mono break-all select-all flex-1 pr-2">
                    {candidateLink}
                  </span>
                  
                  <button
                    onClick={handleCopyLink}
                    className={`p-2.5 rounded-xl border transition-all duration-300 ${
                      copied
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-800/80 border-white/6 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    }`}
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="flex gap-3 mt-1">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-white/6 text-slate-300 py-3 rounded-2xl transition font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Copy Invite Link
                  </button>
                  
                  <button
                    onClick={handleEndSession}
                    className="flex-1 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-transparent text-rose-400 hover:text-white py-3 rounded-2xl transition font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    End Session
                  </button>
                </div>
              </div>
            </div>

            {/* MAIN PORTION: LIVE FEEDS */}
            <div className="col-span-2 flex flex-col gap-6 h-full">
              
              {/* STAGE 1 SUBMISSION BOX */}
              <div className="bg-slate-900/45 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6 shadow-xl shadow-slate-950/20 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/4 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </span>
                    <h3 className="font-bold text-base text-slate-200">Stage 1: Code Submission</h3>
                  </div>

                  {submission ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Received
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 animate-pulse flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      Awaiting Submission
                    </span>
                  )}
                </div>

                {submission ? (
                  <div className="grid grid-cols-2 gap-6">
                    {/* LEFT COLUMN: CANDIDATE SOLUTION */}
                    <div className="flex flex-col gap-4">
                      <span className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                        Candidate's Submission
                      </span>
                      
                      {/* Candidate IDE Mockup */}
                      <div className="bg-slate-950 border border-white/6 rounded-2xl overflow-hidden shadow-inner flex flex-col flex-1">
                        <div className="bg-slate-900 px-4 py-2 border-b border-white/4 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-xs text-slate-500 font-mono ml-2">candidate_solution.{getFileExtension(sessionLanguage)}</span>
                          </div>
                          <span className="text-[10px] text-slate-600 font-mono">{sessionLanguage}</span>
                        </div>
                        
                        <div className="p-4 font-mono text-[13px] overflow-x-auto text-indigo-200/90 leading-relaxed bg-slate-950/90 max-h-72 flex-1">
                          <pre className="whitespace-pre">{submission.candidateCode}</pre>
                        </div>
                      </div>

                      {/* Candidate Explanation */}
                      <div className="bg-slate-800/20 border border-white/4 rounded-2xl p-5 flex gap-4">
                        <div className="text-indigo-400 shrink-0">
                          <svg className="w-6 h-6 opacity-40" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9.904 17H5V12.096C5 8.795 7.643 6 10.904 6V8.192c-1.848 0-3.348 1.48-3.348 3.269H9.904V17zm7.096 0h-4.904V12.096c0-3.301 2.643-6.096 5.904-6.096V8.192c-1.848 0-3.348 1.48-3.348 3.269H17V17z" />
                          </svg>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] text-slate-500 font-bold tracking-wide uppercase">Candidate Explanation</span>
                          <p className="text-xs text-slate-350 leading-relaxed italic">
                            "{submission.candidateExplanation}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: AI SOLUTION */}
                    <div className="flex flex-col gap-4">
                      <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase pl-1">
                        AI Model Solution (Reference)
                      </span>
                      
                      {/* AI IDE Mockup */}
                      <div className="bg-slate-950 border border-indigo-500/20 rounded-2xl overflow-hidden shadow-inner flex flex-col flex-1">
                        <div className="bg-indigo-950/40 px-4 py-2 border-b border-indigo-950/50 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#23a55a]" />
                            <span className="text-xs text-indigo-400/70 font-mono ml-2">ideal_solution.{getFileExtension(sessionLanguage)}</span>
                          </div>
                          <span className="text-[10px] text-indigo-400 font-mono">Ideal {sessionLanguage}</span>
                        </div>
                        
                        <div className="p-4 font-mono text-[13px] overflow-x-auto text-emerald-200/90 leading-relaxed bg-slate-950/95 max-h-72 flex-1">
                          <pre className="whitespace-pre">{fixedCode}</pre>
                        </div>
                      </div>

                      {/* AI Explanation */}
                      <div className="bg-indigo-950/15 border border-indigo-900/10 rounded-2xl p-5 flex gap-4">
                        <div className="text-indigo-400 shrink-0">
                          <svg className="w-6 h-6 opacity-40 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9.904 17H5V12.096C5 8.795 7.643 6 10.904 6V8.192c-1.848 0-3.348 1.48-3.348 3.269H9.904V17zm7.096 0h-4.904V12.096c0-3.301 2.643-6.096 5.904-6.096V8.192c-1.848 0-3.348 1.48-3.348 3.269H17V17z" />
                          </svg>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] text-indigo-400/80 font-bold tracking-wide uppercase">AI Bug Explanation</span>
                          <p className="text-xs text-slate-350 leading-relaxed italic">
                            "{bugExplanation}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Submission Placeholder */
                  <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-white/5 rounded-2xl text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/40 border border-white/4 flex items-center justify-center text-slate-500 mb-4 animate-pulse">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-sm text-slate-400 mb-1">Awaiting Candidate Code</h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      As soon as the candidate submits their bug fix or their 10-minute timer runs out, the code will show up here live.
                    </p>
                  </div>
                )}
              </div>

              {/* STAGE 2 CHAT LIVE FEED */}
              <div className="bg-slate-900/45 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6 shadow-xl shadow-slate-950/20 flex flex-col gap-4 flex-1">
                <div className="flex items-center justify-between border-b border-white/4 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </span>
                    <h3 className="font-bold text-base text-slate-200">Stage 2: Live Chat Feed</h3>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    Team Workspace Simulation
                  </span>
                </div>

                {messages.length > 0 ? (
                  <div className="flex flex-col gap-3.5 max-h-80 overflow-y-auto pr-1">
                    {messages.map(msg => (
                      <div key={msg.messageId} className="flex gap-3.5 bg-slate-800/15 border border-white/3 rounded-2xl p-4 transition-all hover:bg-slate-850">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-indigo-600 shadow-md flex items-center justify-center shrink-0 text-white font-bold text-sm">
                          {msg.senderName.substring(0, 1).toUpperCase()}
                        </div>
                        
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex items-baseline justify-between">
                            <span className="font-bold text-sm text-indigo-300">{msg.senderName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Candidate Message</span>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed pr-2">
                            {msg.messageContent}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Chat Placeholder */
                  <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-white/5 rounded-2xl text-center flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/40 border border-white/4 flex items-center justify-center text-slate-500 mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-sm text-slate-400 mb-1">Awaiting Candidate Messages</h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      If the candidate struggles with the bug in Stage 2, they will unlock a simulated team workspace. Their chat messages will appear here in real-time.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  )
}