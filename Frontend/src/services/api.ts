import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5138/api'
})

export const login = (password: string) =>
  api.post('/auth/login', JSON.stringify(password), {
    headers: { 'Content-Type': 'application/json' }
  })

export const createSession = (jobRole: string) =>
  api.post('/session', { jobRole })

export const getSession = (sessionId: string) =>
  api.get(`/session/${sessionId}`)

export const deleteSession = (sessionId: string) =>
  api.delete(`/session/${sessionId}`)

export const submitSolution = (sessionId: string, candidateCode: string, candidateExplanation: string) =>
  api.post(`/submission/${sessionId}`, { candidateCode, candidateExplanation })

export const getSubmission = (sessionId: string) =>
  api.get(`/submission/${sessionId}`)

export const postMessage = (sessionId: string, senderName: string, messageContent: string) =>
  api.post(`/chat/${sessionId}`, { senderName, messageContent })

export const getMessages = (sessionId: string) =>
  api.get(`/chat/${sessionId}`)