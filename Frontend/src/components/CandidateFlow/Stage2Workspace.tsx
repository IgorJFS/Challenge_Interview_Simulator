import { useState, useEffect, useRef } from 'react'
import { postMessage } from '../../services/api'

const TIMER_SECONDS = 10 * 60

const FAKE_COWORKERS = [
  { name: 'Sarah Chen', role: 'Frontend Dev', online: true, color: 'bg-emerald-500', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120' },
  { name: 'Marcus Silva', role: 'Backend Dev', online: true, color: 'bg-indigo-500', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120' },
  { name: 'Julia Ramos', role: 'Tech Lead', online: true, color: 'bg-fuchsia-500', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120&h=120' },
  { name: 'Pedro Costa', role: 'QA Engineer', online: false, color: 'bg-slate-500', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120' },
  { name: 'Ana Lima', role: 'DevOps', online: false, color: 'bg-slate-500', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120' },
]

// Pool of coworker chat messages for #general that will be added one-by-one in a slow loop
const COWORKER_MESSAGE_POOL = [
  { sender: 'Sarah Chen', text: 'Hey team, did anyone check the latest build?', avatarColor: 'from-emerald-500 to-teal-600', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120' },
  { sender: 'Marcus Silva', text: 'Yeah, it compiled fine on my local machine. No major warnings.', avatarColor: 'from-indigo-500 to-blue-600', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120' },
  { sender: 'Julia Ramos', text: 'Great, remember we have the team standup coming up soon.', avatarColor: 'from-fuchsia-500 to-purple-600', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120&h=120' },
  { sender: 'Sarah Chen', text: 'Perfect, I will finish my PR reviews before that.', avatarColor: 'from-emerald-500 to-teal-600', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120' },
  { sender: 'Marcus Silva', text: 'By the way, did the new candidate join our Slack workspace yet?', avatarColor: 'from-indigo-500 to-blue-600', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120' },
  { sender: 'Julia Ramos', text: 'Yes, they should be logging into the #general channel in a minute.', avatarColor: 'from-fuchsia-500 to-purple-600', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120&h=120' },
  { sender: 'Sarah Chen', text: 'Awesome! Let\'s welcome them and make sure they feel at home.', avatarColor: 'from-emerald-500 to-teal-600', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120' },
  { sender: 'Marcus Silva', text: 'If they need help setting up the local developer environment, I can jump on a quick call.', avatarColor: 'from-indigo-500 to-blue-600', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120' },
  { sender: 'Julia Ramos', text: 'Thanks Marcus! Candidate, if you face any issues, feel free to ping me directly in my DM.', avatarColor: 'from-fuchsia-500 to-purple-600', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120&h=120' },
  { sender: 'Sarah Chen', text: 'I\'ll be online too in case there are frontend queries.', avatarColor: 'from-emerald-500 to-teal-600', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120' },
  { sender: 'Marcus Silva', text: 'Let\'s keep pushing, we have a big release this week!', avatarColor: 'from-indigo-500 to-blue-600', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120' },
]

// Simple, direct survival tips in English
const HINTS = [
  'If you have issues delivering a feature, contact the Tech Lead.',
  'Stuck on the bug? Ask your teammates in #general for help.',
  'Keep the team updated on your progress to show transparency.',
  'Good communication under pressure is highly valued by the interviewer.',
]

interface Message {
  id: number
  sender: string
  text: string
  time: string
  isCandidate?: boolean
  avatarColor?: string
  avatar?: string
}

interface Props {
  sessionId: string
}

export default function Stage2Workspace({ sessionId }: Props) {
  const [activeTab, setActiveTab] = useState<'general' | 'techlead'>('general')
  const [generalMessages, setGeneralMessages] = useState<Message[]>([
    { id: 0, sender: 'System', text: 'Welcome to the DevTeam workspace! Use this simulation to communicate with your team.', time: '09:00', avatarColor: 'from-slate-700 to-slate-800' }
  ])
  const [techleadMessages, setTechleadMessages] = useState<Message[]>([
    { id: 100, sender: 'Julia Ramos', text: 'Hi there! I am the Tech Lead of this team. If you are having issues delivering a feature or have questions about the challenge, feel free to ask me here in my DM.', time: '09:01', avatarColor: 'from-fuchsia-500 to-purple-600', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120&h=120' }
  ])
  const [input, setInput] = useState('')
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  
  const poolIndexRef = useRef(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const alertedTimeUp = useRef(false)

  // Load or initialize countdown timer using localStorage to survive browser refreshes
  const getInitialTime = () => {
    const stageKey = `stage2_timer_end_${sessionId}`
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
    const stageKey = `stage2_timer_end_${sessionId}`
    
    const interval = setInterval(() => {
      const savedEndTime = localStorage.getItem(stageKey)
      if (savedEndTime) {
        const remaining = Math.max(0, Math.floor((parseInt(savedEndTime, 10) - Date.now()) / 1000))
        setTimeLeft(remaining)
        if (remaining <= 0) {
          clearInterval(interval)
          if (!alertedTimeUp.current) {
            alertedTimeUp.current = true
            alert("Time is up! The session has concluded.")
          }
        }
      } else {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            if (!alertedTimeUp.current) {
              alertedTimeUp.current = true
              alert("Time is up! The session has concluded.")
            }
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [sessionId])

  // Looping coworker messages: adds a new message to #general every 20 seconds
  useEffect(() => {
    const messageInterval = setInterval(() => {
      const nextCoworkerMsg = COWORKER_MESSAGE_POOL[poolIndexRef.current]
      poolIndexRef.current = (poolIndexRef.current + 1) % COWORKER_MESSAGE_POOL.length

      const nowStr = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      })

      const newMsg: Message = {
        id: Date.now() + Math.random(),
        sender: nextCoworkerMsg.sender,
        text: nextCoworkerMsg.text,
        time: nowStr,
        avatarColor: nextCoworkerMsg.avatarColor,
        avatar: nextCoworkerMsg.avatar
      }

      setGeneralMessages(prev => [...prev, newMsg])
    }, 20000) // 20 seconds loop as customized by the user

    return () => clearInterval(messageInterval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [generalMessages, techleadMessages, activeTab])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const now = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    })
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const nowStr = now()
    const textToSend = input

    const newCandidateMsg: Message = {
      id: Date.now(),
      sender: 'You (Candidate)',
      text: textToSend,
      time: nowStr,
      isCandidate: true,
      avatarColor: 'from-blue-600 to-indigo-700',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120'
    }

    setInput('')

    if (activeTab === 'general') {
      setGeneralMessages(prev => [...prev, newCandidateMsg])
      try {
        await postMessage(sessionId, 'Candidate', textToSend)
      } catch {
        console.error('Failed to save message')
      }
    } else {
      setTechleadMessages(prev => [...prev, newCandidateMsg])
      try {
        // Tag message so the interviewer knows it was a direct message to Tech Lead
        await postMessage(sessionId, 'Candidate', `[Tech Lead DM] ${textToSend}`)
      } catch {
        console.error('Failed to save message')
      }

      // Simulated Tech Lead automatic smart responsive reply
      setTimeout(() => {
        const juliaReply: Message = {
          id: Date.now() + 1,
          sender: 'Julia Ramos',
          text: 'Thanks for updating me. Good communication and transparency are key skills here. I\'ll make sure to note your update! Keep up the good work.',
          time: now(),
          avatarColor: 'from-fuchsia-500 to-purple-650',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120&h=120'
        }
        setTechleadMessages(prev => [...prev, juliaReply])
      }, 4000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNextHint = () => {
    setCurrentHintIndex(prev => (prev + 1) % HINTS.length)
  }

  const handlePrevHint = () => {
    setCurrentHintIndex(prev => (prev - 1 + HINTS.length) % HINTS.length)
  }

  const activeMessages = activeTab === 'general' ? generalMessages : techleadMessages

  return (
    <div className="flex h-screen bg-[#1e1f22] text-[#dbdee1] font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* 1. DISCORD FAR-LEFT SERVER RAIL */}
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 shrink-0 border-r border-[#151618]/30">
        
        {/* Active Server Button */}
        <div className="relative group flex items-center justify-center w-full">
          <div className="absolute left-0 w-1 h-10 bg-white rounded-r-md transition-all duration-300" />
          <button className="w-12 h-12 rounded-[16px] bg-[#5865f2] text-white flex items-center justify-center font-bold text-lg shadow-lg cursor-pointer transition-all duration-200 hover:rounded-[12px] hover:bg-[#4752c4]">
            DT
          </button>
          
          {/* Tooltip */}
          <div className="absolute left-[80px] bg-[#111214] text-[#dbdee1] text-xs font-bold px-3 py-1.5 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none whitespace-nowrap z-50">
            DevTeam Workspace
          </div>
        </div>

        <div className="w-8 h-[2px] bg-[#35363c] rounded my-1" />

        {/* Dummy Server Buttons */}
        <div className="relative group flex items-center justify-center w-full">
          <button className="w-12 h-12 rounded-[24px] bg-[#313338] text-slate-400 flex items-center justify-center font-bold text-sm cursor-not-allowed transition-all duration-200 hover:rounded-[12px] hover:bg-[#23a55a] hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className="absolute left-[80px] bg-[#111214] text-[#dbdee1] text-xs font-bold px-3 py-1.5 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none whitespace-nowrap z-50">
            Add Workspace (Locked)
          </div>
        </div>

        <div className="relative group flex items-center justify-center w-full">
          <button className="w-12 h-12 rounded-[24px] bg-[#313338] text-[#23a55a] flex items-center justify-center font-bold text-sm cursor-not-allowed transition-all duration-200 hover:rounded-[12px] hover:bg-[#23a55a] hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <div className="absolute left-[80px] bg-[#111214] text-[#dbdee1] text-xs font-bold px-3 py-1.5 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none whitespace-nowrap z-50">
            Explore Workspaces
          </div>
        </div>

      </div>

      {/* 2. CHANNELS & DM SIDEBAR */}
      <div className="w-60 bg-[#2b2d31] flex flex-col shrink-0 border-r border-[#1f2023]/40">
        
        {/* Server Header */}
        <div className="h-12 border-b border-[#1f2023] flex items-center justify-between px-4 shadow-sm select-none">
          <span className="font-bold text-sm text-white truncate">DevTeam Workspace</span>
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto px-2 py-3.5 flex flex-col gap-5">
          {/* Text channels category */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5 select-none">
              <span className="text-[10px] uppercase font-bold text-[#949ba4] tracking-wider">Text Channels</span>
            </div>
            
            <div className="flex flex-col gap-0.5">
              {/* general channel */}
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13.5px] font-semibold text-left select-none cursor-pointer transition ${
                  activeTab === 'general'
                    ? 'bg-[#404249] text-white shadow-xs'
                    : 'text-[#949ba4] hover:bg-[#35373c]/60 hover:text-[#dbdee1]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[#949ba4] text-lg font-mono">#</span>
                  <span>general</span>
                </div>
                {activeTab !== 'general' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </button>
            </div>
          </div>

          {/* Direct messages category */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5 select-none">
              <span className="text-[10px] uppercase font-bold text-[#949ba4] tracking-wider">Direct Messages</span>
            </div>

            <div className="flex flex-col gap-0.5">
              {/* DM with Tech Lead */}
              <button
                onClick={() => setActiveTab('techlead')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13.5px] font-semibold text-left select-none cursor-pointer transition ${
                  activeTab === 'techlead'
                    ? 'bg-[#404249] text-white shadow-xs'
                    : 'text-[#949ba4] hover:bg-[#35373c]/60 hover:text-[#dbdee1]'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="relative shrink-0 select-none">
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120&h=120"
                      alt="Julia Ramos" 
                      className="w-5 h-5 rounded-full object-cover shadow-sm border border-[#1f2023]/40"
                    />
                    <span className="w-1.5 h-1.5 bg-emerald-500 border border-[#2b2d31] rounded-full absolute bottom-0 right-0" />
                  </div>
                  <span className="truncate">Julia Ramos (Tech Lead)</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Profile / Status Footer */}
        <div className="h-14 bg-[#232428] flex items-center justify-between px-2.5 py-2">
          <div className="flex items-center gap-2 overflow-hidden select-none">
            <div className="relative shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120" 
                alt="You" 
                className="w-8 h-8 rounded-full object-cover relative border border-[#151618]/30 shadow-inner"
              />
              <span className="w-2.5 h-2.5 bg-emerald-500 border border-[#232428] rounded-full absolute bottom-0 right-0 animate-pulse" />
            </div>
            <div className="flex flex-col overflow-hidden leading-tight">
              <span className="text-white text-[12.5px] font-bold truncate">You</span>
              <span className="text-[#949ba4] text-[10.5px] truncate font-medium">Candidate</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[#949ba4]">
            <button className="p-1.5 rounded hover:bg-[#313338] hover:text-[#dbdee1] transition shrink-0 cursor-not-allowed" title="Mute Microphone">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <button className="p-1.5 rounded hover:bg-[#313338] hover:text-[#dbdee1] transition shrink-0 cursor-not-allowed" title="Deafen Audio">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
        </div>

      </div>

      {/* 3. MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col bg-[#313338]">
        
        {/* Chat Top Header */}
        <div className="h-12 border-b border-[#1f2023] flex items-center justify-between px-6 shadow-sm shrink-0">
          <div className="flex items-center gap-2 overflow-hidden select-none">
            {activeTab === 'general' ? (
              <>
                <span className="text-[#949ba4] text-xl font-mono font-bold">#</span>
                <span className="font-bold text-white text-[14.5px] truncate">general</span>
                <div className="w-[1px] h-4 bg-[#3f4147] mx-2 hidden sm:block" />
                <span className="text-xs text-[#949ba4] font-medium hidden sm:block truncate leading-none">
                  Company general discussion and collaboration channel.
                </span>
              </>
            ) : (
              <>
                <span className="text-[#949ba4] text-md font-bold">@</span>
                <span className="font-bold text-white text-[14.5px] truncate">Julia Ramos (Tech Lead)</span>
                <div className="w-[1px] h-4 bg-[#3f4147] mx-2 hidden sm:block" />
                <span className="text-xs text-[#949ba4] font-medium hidden sm:block truncate leading-none">
                  Private direct message session with your Tech Lead.
                </span>
              </>
            )}
          </div>

          {/* Countdown live timer badge */}
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm font-mono text-[12.5px] font-extrabold tracking-tight select-none ${
            timeLeft < 60 
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse'
              : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${timeLeft < 60 ? 'bg-rose-400' : 'bg-amber-400 animate-pulse'}`} />
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>

        {/* 4. HINTS BOARD: SHINY BANNER AT THE TOP */}
        <div className="px-6 pt-4 shrink-0">
          <div className="bg-gradient-to-r from-amber-500/[0.07] via-amber-600/[0.04] to-indigo-500/[0.07] border border-amber-500/20 rounded-2xl p-4 shadow-md flex items-start justify-between gap-4 relative overflow-hidden group">
            
            {/* Ambient gold glow on background */}
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0 select-none">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 select-none">
                  <span className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">Interview Hints</span>
                  <span className="text-[10px] text-slate-500 font-mono select-none">({currentHintIndex + 1}/{HINTS.length})</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed max-w-2xl select-text transition-all duration-500">
                  {HINTS[currentHintIndex]}
                </p>
              </div>
            </div>

            {/* Hint Navigation controls */}
            <div className="flex items-center gap-1.5 shrink-0 select-none">
              <button
                onClick={handlePrevHint}
                className="p-1.5 rounded-lg bg-slate-800/40 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Previous Hint"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNextHint}
                className="p-1.5 rounded-lg bg-slate-800/40 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Next Hint"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 5. MESSAGES LIST */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          
          {/* Welcome Message Divider */}
          <div className="flex flex-col items-start gap-1 pb-4 pt-2 border-b border-[#3f4147]/30 select-none">
            <div className="w-14 h-14 rounded-2xl bg-[#35373c] flex items-center justify-center text-2xl font-bold text-white mb-2 shadow-inner">
              {activeTab === 'general' ? '#' : '@'}
            </div>
            <h4 className="text-xl font-extrabold text-white">
              {activeTab === 'general' ? 'Welcome to #general!' : 'Welcome to Julia Ramos\' DM!'}
            </h4>
            <p className="text-xs text-[#949ba4]">
              {activeTab === 'general' 
                ? 'This is the start of the conversational thread in the #general channel.' 
                : 'This is the start of your private direct message history with the team\'s Tech Lead.'}
            </p>
          </div>

          {/* Actual messages feed list */}
          <div className="flex flex-col gap-5 pt-2">
            {activeMessages.map((msg, index) => {
              const isCandidate = msg.isCandidate
              const isSystem = msg.sender === 'System'
              
              if (isSystem) {
                return (
                  <div key={msg.id || index} className="bg-slate-800/10 border border-white/5 rounded-2xl px-5 py-4 text-xs text-[#949ba4] leading-relaxed flex items-center gap-3 select-none">
                    <svg className="w-4.5 h-4.5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.086 1.086L12.54 13.25l-.041.02a.75.75 0 11-1.086-1.086L11.83 11.83zm-.517 7.027A9.75 9.75 0 0012 21.75a9.75 9.75 0 005.15-1.45L12 18.277zm0 0a9.75 9.75 0 01-5.15-1.45L12 18.277z" />
                    </svg>
                    <span>{msg.text}</span>
                  </div>
                )
              }

              return (
                <div 
                  key={msg.id || index} 
                  className={`flex gap-4 group hover:bg-[#2e3035]/30 -mx-6 px-6 py-2.5 transition duration-150 relative ${
                    isCandidate ? 'bg-[#5865f2]/5 border-l-4 border-[#5865f2]' : ''
                  }`}
                >
                  {/* Left Avatar */}
                  {msg.avatar ? (
                    <img 
                      src={msg.avatar} 
                      alt={msg.sender} 
                      className="w-10 h-10 rounded-full object-cover shrink-0 shadow-md border border-[#1f2023]/40"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${
                      msg.avatarColor || (isCandidate ? 'from-blue-600 to-indigo-700' : 'from-indigo-500 to-purple-650')
                    } flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-md border border-[#1f2023]/40 select-none`}>
                      {msg.sender.substring(0, 1).toUpperCase()}
                    </div>
                  )}

                  {/* Message Core Body */}
                  <div className="flex flex-col gap-1 w-full overflow-hidden select-text">
                    <div className="flex items-baseline gap-2">
                      <span className={`font-bold text-[14.5px] truncate ${
                        isCandidate ? 'text-[#5865f2] font-extrabold' : 'text-indigo-300 font-bold'
                      }`}>
                        {msg.sender}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium font-mono select-none">{msg.time}</span>
                    </div>
                    <p className="text-[#dbdee1] text-[13.5px] leading-relaxed pr-6 break-words whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 6. MESSAGE INPUT BAR - DISCORD STYLE */}
        <div className="px-6 pb-6 pt-2 shrink-0">
          <div className="flex flex-col gap-1.5">
            
            <div className="bg-[#383a40] border border-[#2f3136] rounded-xl flex items-center px-4 py-2.5 shadow-sm group focus-within:ring-2 focus-within:ring-indigo-500/50 transition">
              {/* Fake upload button */}
              <button className="text-[#b5bac1] hover:text-[#dbdee1] p-1 rounded-full hover:bg-slate-700 transition shrink-0 mr-3 cursor-not-allowed" title="Attach file">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>

              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeTab === 'general' ? 'Message #general' : 'Message @Julia Ramos'}
                className="flex-1 bg-transparent text-white text-[14px] outline-none placeholder-[#858591]"
              />

              {/* Emoji bar placeholders */}
              <div className="flex items-center gap-1.5 text-[#b5bac1] shrink-0 ml-3 select-none">
                <button className="p-1 rounded hover:bg-slate-700 hover:text-[#dbdee1] transition cursor-not-allowed" title="Insert GIF">
                  <span className="font-mono font-extrabold text-[10px] border border-[#b5bac1] px-1 rounded">GIF</span>
                </button>
                <button className="p-1 rounded hover:bg-slate-700 hover:text-[#dbdee1] transition cursor-not-allowed" title="Select Sticker">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                {/* Send Button */}
                <button
                  onClick={handleSend}
                  className="p-1.5 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] text-white transition ml-1 cursor-pointer"
                  title="Send Message"
                >
                  <svg className="w-4 h-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Input tip banner */}
            <span className="text-[10.5px] text-[#949ba4] font-medium leading-none select-none pl-1 flex items-center gap-1">
              <span className="font-bold text-indigo-400">Pro-Tip:</span>
              <span>Press <kbd className="bg-[#2b2d31] border border-white/5 px-1.5 py-0.5 rounded text-[9.5px]">Enter</kbd> to broadcast your message to the team workspace.</span>
            </span>

          </div>
        </div>

      </div>

      {/* 7. RIGHT-SIDE DISCORD MEMBERS RAIL (DESKTOP) */}
      <div className="w-60 bg-[#2b2d31] flex flex-col shrink-0 overflow-y-auto px-4 py-4 select-none border-l border-[#1f2023]/40">
        
        {/* ONLINE GROUP */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-bold text-[#949ba4] tracking-wider mb-1 select-none">
            Online Members — {FAKE_COWORKERS.filter(c => c.online).length + 1}
          </span>

          {/* Active Candidate */}
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-[#35373c]/40 transition group cursor-default">
            <div className="relative shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120"
                alt="You" 
                className="w-8 h-8 rounded-full object-cover shadow-sm border border-[#1f2023]/40"
              />
              <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-[#2b2d31] rounded-full absolute bottom-0 right-0" />
            </div>
            <div className="flex flex-col overflow-hidden leading-tight">
              <span className="text-white text-[13px] font-bold truncate">You (Candidate)</span>
              <span className="text-indigo-400 text-[10.5px] truncate font-semibold">Interviewee</span>
            </div>
          </div>

          {/* Coworkers */}
          {FAKE_COWORKERS.filter(cw => cw.online).map(cw => (
            <div key={cw.name} className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-[#35373c]/40 transition group cursor-default">
              {/* Member Avatar */}
              {cw.avatar ? (
                <div className="relative shrink-0 select-none">
                  <img 
                    src={cw.avatar} 
                    alt={cw.name} 
                    className="w-8 h-8 rounded-full object-cover shadow-sm border border-[#1f2023]/40"
                  />
                  <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-[#2b2d31] rounded-full absolute bottom-0 right-0" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#35373c] flex items-center justify-center font-extrabold text-[#dbdee1] text-xs shrink-0 relative">
                  {cw.name.substring(0, 1)}
                  <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-[#2b2d31] rounded-full absolute bottom-0 right-0" />
                </div>
              )}
              <div className="flex flex-col overflow-hidden leading-tight">
                <span className="text-[#dbdee1] text-[13px] font-semibold truncate group-hover:text-white">{cw.name}</span>
                <span className="text-[#949ba4] text-[10.5px] truncate font-medium">{cw.role}</span>
              </div>
            </div>
          ))}
        </div>

        {/* OFFLINE GROUP */}
        <div className="flex flex-col gap-1.5 mt-6">
          <span className="text-[10px] uppercase font-bold text-[#949ba4] tracking-wider mb-1">
            Offline Members — {FAKE_COWORKERS.filter(cw => !cw.online).length}
          </span>
          
          {FAKE_COWORKERS.filter(cw => !cw.online).map(cw => (
            <div key={cw.name} className="flex items-center gap-2.5 px-2 py-2 rounded-md opacity-40 hover:opacity-80 transition group cursor-default">
              {/* Member Avatar */}
              {cw.avatar ? (
                <img 
                  src={cw.avatar} 
                  alt={cw.name} 
                  className="w-8 h-8 rounded-full object-cover opacity-60 grayscale shadow-sm border border-[#1f2023]/40 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1e1f22] flex items-center justify-center font-extrabold text-slate-400 text-xs shrink-0">
                  {cw.name.substring(0, 1)}
                </div>
              )}
              <div className="flex flex-col overflow-hidden leading-tight">
                <span className="text-[#dbdee1] text-[13px] font-semibold truncate">{cw.name}</span>
                <span className="text-[#949ba4] text-[10.5px] truncate font-medium">{cw.role}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  )
}