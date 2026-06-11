import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'

export default function InterviewerLogin() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!password) return
    setLoading(true)
    setError('')
    try {
      await login(password)
      localStorage.setItem('interviewer-auth', 'true')
      navigate('/dashboard')
    } catch {
      setError('Senha incorreta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-zinc-950 text-white relative overflow-hidden flex items-center justify-center font-sans selection:bg-indigo-500/30">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm bg-slate-900/45 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8 shadow-2xl shadow-slate-950/50 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-bold bg-linear-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Interviewer Portal
          </h1>
          <p className="text-xs text-slate-400">
            Enter your password to access the panel.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-indigo-400 tracking-wider uppercase px-0.5">
              Password
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                disabled={loading}
                className="w-full bg-slate-800/40 border border-white/6 text-white rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L5.636 5.636m4.242 4.242L18.364 18.364" />
                  </svg>
                ) : (
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-rose-400 text-xs px-1 flex items-center gap-1.5 animate-pulse">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full relative overflow-hidden rounded-xl py-3 font-bold text-sm tracking-wider uppercase transition-all duration-300 shadow-md ${
              loading
                ? 'bg-slate-800 border border-white/6 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-950/40 hover:shadow-indigo-500/10 active:scale-[0.99] border-t border-white/20 cursor-pointer'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Verifying...</span>
              </div>
            ) : (
              <span>Enter Portal</span>
            )}
          </button>

          <div className="mt-2 p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-slate-300 flex gap-2.5 leading-relaxed">
            <svg className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-indigo-300">Testing the application?</span>
              <p>
                Use the password <span className="font-mono bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-500/30 text-indigo-200">testsim</span>.
                Since testing runs on free hosting, it might take a couple of seconds to wake up the server and start.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}