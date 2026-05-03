'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { FaPaperPlane, FaRobot, FaUser, FaRedo } from 'react-icons/fa'
import { startChat, sendChatMessage, resetChat } from '@/services/chatbot'
import type { ChatLimit } from '@/services/chatbot'

interface DisplayMessage {
  id: number
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

function ChatbotContent() {
  const searchParams = useSearchParams()
  const projectId = searchParams?.get('project_id') || null

  const [sessionId, setSessionId] = useState<string>('')
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [limit, setLimit] = useState<ChatLimit | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const initChat = async () => {
    try {
      setInitializing(true)
      const data = await startChat(projectId || undefined)
      setSessionId(data.session_id)
      setMessages([{
        id: Date.now(),
        type: 'bot',
        content: data.message,
        timestamp: new Date(),
      }])
      if (data.limit) setLimit(data.limit)
    } catch (err) {
      console.error('Failed to init chat:', err)
      setMessages([{
        id: Date.now(),
        type: 'bot',
        content: "Hello! I'm Vera, your code assistant. I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date(),
      }])
    } finally {
      setInitializing(false)
    }
  }

  useEffect(() => {
    initChat()
  }, [projectId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: DisplayMessage = {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const data = await sendChatMessage(text, sessionId)
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: data.message,
        timestamp: new Date(),
      }])
      if (data.limit) setLimit(data.limit)
    } catch (error: any) {
      const errorMsg = error?.response?.status === 429
        ? "Daily chat limit reached. Upgrade to Pro for unlimited chat."
        : "Sorry, I couldn't get a response. Please try again."
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: errorMsg,
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendMessage(input)
  }

  const handleReset = async () => {
    if (sessionId) {
      try {
        await resetChat(sessionId)
      } catch {
        // Ignore reset errors
      }
    }
    setMessages([])
    setLimit(null)
    await initChat()
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vera — AI Assistant</h1>
          <p className="text-gray-400 mt-1">
            {limit ? `${limit.remaining} messages remaining` : 'Get instant advice on code quality and mitigation strategies'}
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={initializing || loading}
          className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 hover:text-white rounded-lg transition-colors border border-dark-600 disabled:opacity-50"
        >
          <FaRedo />
          New Chat
        </button>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-dark-800 rounded-lg border border-dark-700 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {initializing && (
            <div className="flex gap-4 justify-start">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <FaRobot className="text-white" />
              </div>
              <div className="bg-dark-700 rounded-lg p-4 flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-gray-300">Initializing chat session...</span>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'bot' && (
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaRobot className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  message.type === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 text-gray-100'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div
                  className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-primary-100' : 'text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
              {message.type === 'user' && (
                <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaUser className="text-gray-400" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 justify-start">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <FaRobot className="text-white" />
              </div>
              <div className="bg-dark-700 rounded-lg p-4">
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
              <p className="text-yellow-400 text-sm">Daily limit reached. Upgrade to Pro for unlimited chat.</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {messages.length <= 1 && !loading && !initializing && (
          <div className="px-4 py-2 border-t border-dark-700/50 flex flex-wrap gap-2">
            {['How to reduce risk?', 'Explain complexity', 'Help'].map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="text-xs px-3 py-1.5 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 hover:text-primary-300 rounded-full transition-colors border border-primary-500/20"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-dark-700 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Vera about your code..."
              className="flex-1 px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading || initializing || limit?.remaining === 0}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || initializing || limit?.remaining === 0}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaPaperPlane />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ChatbotPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
        <ChatbotContent />
      </Suspense>
    </DashboardLayout>
  )
}
