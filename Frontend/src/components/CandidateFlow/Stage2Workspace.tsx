import { useState, useEffect, useRef } from 'react'
import { postMessage, getMessages } from '../../services/api'

const TIMER_SECONDS = 10 * 60

const FAKE_COWORKERS = [
  { name: 'Sarah Chen', role: 'Frontend Dev', online: true },
  { name: 'Marcus Silva', role: 'Backend Dev', online: true },
  { name: 'Julia Ramos', role: 'Tech Lead', online: true },
  { name: 'Pedro Costa', role: 'QA Engineer', online: false },
  { name: 'Ana Lima', role: 'DevOps', online: false },
]

const INITIAL_MESSAGES = [
  { id: 1, sender: 'Sarah Chen', text: 'Good luck at work today everyone!', time: '09:01' },
  { id: 2, sender: 'Marcus Silva', text: 'Finished my tasks, let me know if anyone needs help.', time: '09:14' },
  { id: 3, sender: 'Julia Ramos', text: 'Team standup in 30 minutes, don\'t forget.', time: '09:22' },
]

const HINTS = [
  'Remember to update the team when you finish your tasks.',
  'If you\'re struggling with a task, contact your team\'s senior or tech lead.',
  'Let the team know you\'re having trouble even if you\'re going to schedule a meeting with the lead.',
  'A clear bug description helps your team understand the issue faster.',
  'Don\'t wait too long to ask for help — communication is a key skill.',
]

interface Message {
  id: number
  sender: string
  text: string
  time: string
  isCandidate?: boolean
}

interface Props {
  sessionId: string
}

export default function Stage2Workspace({ sessionId }: Props) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [activeTab, setActiveTab] = useState<'general' | 'hints'>('general')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1, 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const now = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

  const handleSend = async () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now(),
      sender: 'You',
      text: input,
      time: now(),
      isCandidate: true
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')

    try {
      await postMessage(sessionId, 'Candidate', input)
    } catch {
      console.error('Failed to save message')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen bg-gray-950">
      <div className="w-56 bg-gray-900 flex flex-col border-r border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <p className="text-white font-semibold text-sm">DevTeam workspace</p>
          <p className={`text-xs font-mono font-bold mt-1 ${timeLeft < 60 ? 'text-red-400' : 'text-yellow-400'}`}>
            {formatTime(timeLeft)}
          </p>
        </div>

        <div className="px-3 py-2">
          <p className="text-gray-500 text-xs uppercase font-semibold mb-2">Channels</p>
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-2 py-1 rounded text-sm ${activeTab === 'general' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            # general
          </button>
          <button
            onClick={() => setActiveTab('hints')}
            className={`w-full text-left px-2 py-1 rounded text-sm mt-1 ${activeTab === 'hints' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            # hints
          </button>
        </div>

        <div className="px-3 py-2 mt-2">
          <p className="text-gray-500 text-xs uppercase font-semibold mb-2">Members</p>
          {FAKE_COWORKERS.map(cw => (
            <div key={cw.name} className="flex items-center gap-2 py-1">
              <div className={`w-2 h-2 rounded-full ${cw.online ? 'bg-green-400' : 'bg-gray-600'}`} />
              <div>
                <p className="text-gray-300 text-xs">{cw.name}</p>
                <p className="text-gray-500 text-xs">{cw.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeTab === 'general' ? (
          <>
            <div className="px-6 py-3 border-b border-gray-800">
              <p className="text-white font-semibold text-sm"># general</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.isCandidate ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-xs font-semibold ${msg.isCandidate ? 'text-blue-400' : 'text-green-400'}`}>
                      {msg.sender}
                    </span>
                    <span className="text-gray-600 text-xs">{msg.time}</span>
                  </div>
                  <div className={`px-3 py-2 rounded-lg text-sm max-w-md ${msg.isCandidate ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-6 py-4 border-t border-gray-800 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message #general"
                className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-gray-800">
              <p className="text-white font-semibold text-sm"># hints</p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              {HINTS.map((hint, i) => (
                <div key={i} className="bg-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300 border-l-4 border-yellow-500">
                  {hint}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}