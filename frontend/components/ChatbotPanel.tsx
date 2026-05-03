'use client'

import { useState, useRef, useEffect } from 'react'
import { FaPaperPlane, FaRobot, FaUser, FaTimes } from 'react-icons/fa'
import { startChat, sendChatMessage, resetChat } from '@/services/chatbot'
import type { ChatLimit } from '@/services/chatbot'

interface Message {
  id: number
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

interface ChatbotPanelProps {
  isOpen: boolean
  onClose: () => void
  projectId?: number | string
}

export default function ChatbotPanel({ isOpen, onClose, projectId }: ChatbotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [limit, setLimit] = useState<ChatLimit | null>(null)
  const [started, setStarted] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && !started) {
      handleStartChat()
    }
  }, [isOpen])

  const handleStartChat = async () => {
    setStarted(true)
    setLoading(true)
    try {
      const data = await startChat(projectId)
      setSessionId(data.session_id)
      setMessages([{ id: 1, type: 'bot', content: data.message, timestamp: new Date() }])
      if (data.limit) setLimit(data.limit)
    } catch (err) {
      setMessages([{ id: 1, type: 'bot', content: "Hello! I'm Vera, your code assistant. How can I help you?", timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    const userText = input.trim()
    setMessages(prev => [...prev, { id: prev.length + 1, type: 'user', content: userText, timestamp: new Date() }])
    setInput('')
    setLoading(true)
    try {
      const data = await sendChatMessage(userText, sessionId!)
      setMessages(prev => [...prev, { id: prev.length + 1, type: 'bot', content: data.message, timestamp: new Date() }])
      if (data.limit) setLimit(data.limit)
    } catch (err: any) {
      const errorMsg = err?.response?.status === 429
        ? "Daily chat limit reached. Upgrade to Pro for unlimited chat."
        : "Sorry, I couldn't get a response. Please try again."
      setMessages(prev => [...prev, { id: prev.length + 1, type: 'bot', content: errorMsg, timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!sessionId) return
    try {
      await resetChat(sessionId)
      setMessages([])
      setStarted(false)
      handleStartChat()
    } catch (err) { console.error('Reset failed') }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full lg:w-96 bg-dark-800 border-l border-dark-700 z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <FaRobot className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Vera — AI Assistant</h3>
              <p className="text-xs text-gray-400">
                {limit ? `${limit.remaining} messages remaining` : 'Code Quality Support'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="text-xs px-2 py-1 bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white rounded transition-colors">Reset</button>
            <button onClick={onClose} className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-white"><FaTimes /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.type === 'bot' && (
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaRobot className="text-white text-sm" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-lg p-3 ${message.type === 'user' ? 'bg-primary-500 text-white' : 'bg-dark-700 text-gray-100'}`}>
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-primary-100' : 'text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
              {message.type === 'user' && (
                <div className="w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaUser className="text-gray-400 text-sm" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <FaRobot className="text-white text-sm" />
              </div>
              <div className="bg-dark-700 rounded-lg p-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          {limit && limit.remaining === 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
              <p className="text-yellow-400 text-xs">Daily limit reached. Upgrade to Pro for unlimited chat.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-dark-700 p-4 bg-dark-800">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Vera about your code..."
              className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              disabled={loading || limit?.remaining === 0}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || limit?.remaining === 0}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPaperPlane />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {['How to reduce risk?', 'Explain complexity', 'Help'].map((q) => (
              <button key={q} type="button" onClick={() => setInput(q)}
                className="text-xs px-3 py-1 bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white rounded-full transition-colors">
                {q}
              </button>
            ))}
          </div>
        </form>
      </div>
    </>
  )
}
