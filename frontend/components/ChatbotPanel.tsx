'use client'

import { useState, useRef, useEffect } from 'react'
import { FaPaperPlane, FaRobot, FaUser, FaTimes, FaSpinner } from 'react-icons/fa'
import { startChat, sendChatMessage } from '@/services/chatbot'
import { getPredictionById } from '@/services/predictions'
import type { ChatOption, ConversationMessage } from '@/services/chatbot'

interface DisplayMessage {
  id: number
  type: 'user' | 'bot'
  content: string
  emoji?: string
  options?: ChatOption[]
  friendlySummary?: string
  timestamp: Date
}

interface ChatbotPanelProps {
  isOpen: boolean
  onClose: () => void
  predictionId?: number | string
}

const generateSessionId = () => `sess_${Math.random().toString(36).substring(2, 15)}`

const convertMessages = (convoMessages: ConversationMessage[], startId: number): DisplayMessage[] => {
  return convoMessages.map((msg, idx) => ({
    id: startId + idx,
    type: 'bot' as const,
    content: msg.text,
    emoji: msg.emoji,
    options: msg.options,
    friendlySummary: msg.friendly_summary,
    timestamp: new Date(),
  }))
}

export default function ChatbotPanel({ isOpen, onClose, predictionId }: ChatbotPanelProps) {
  const [sessionId, setSessionId] = useState<string>('')
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Initialize chat when panel opens
  useEffect(() => {
    if (!isOpen || messages.length > 0) return

    const initChat = async () => {
      try {
        setInitializing(true)
        const newSessionId = generateSessionId()
        setSessionId(newSessionId)

        let riskLevel = 'medium'
        let topFeatures: string[] = []

        if (predictionId) {
          try {
            const pred = await getPredictionById(typeof predictionId === 'string' ? parseInt(predictionId) : predictionId)
            riskLevel = pred.risk_level || 'medium'
            topFeatures = pred.top_risk_features?.map((f: any) => f.feature_name) || []
          } catch {
            // Use defaults
          }
        }

        const res = await startChat({
          session_id: newSessionId,
          risk_level: riskLevel,
          top_features: topFeatures,
        })

        if (res.conversation?.messages) {
          const botMessages = convertMessages(res.conversation.messages, Date.now())
          setMessages(botMessages)
          setQuickReplies(res.conversation.quick_replies || [])
        } else {
          setMessages([{
            id: Date.now(),
            type: 'bot',
            content: "Hello! I'm your code health assistant. How can I help you?",
            timestamp: new Date(),
          }])
        }
      } catch (err) {
        console.error('Failed to init panel chat:', err)
        setMessages([{
          id: Date.now(),
          type: 'bot',
          content: "Hello! I'm having trouble connecting to the ML service. Please try again later.",
          emoji: '⚠️',
          timestamp: new Date(),
        }])
      } finally {
        setInitializing(false)
      }
    }

    initChat()
  }, [isOpen, predictionId])

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
    setQuickReplies([])
    setLoading(true)

    try {
      const currentSessionId = sessionId || generateSessionId()
      if (!sessionId) setSessionId(currentSessionId)

      const response = await sendChatMessage({
        session_id: currentSessionId,
        message: text,
      })

      if (response.conversation?.messages) {
        const botMessages = convertMessages(response.conversation.messages, Date.now() + 1)
        setMessages((prev) => [...prev, ...botMessages])
        setQuickReplies(response.conversation.quick_replies || [])
      } else {
        setMessages((prev) => [...prev, {
          id: Date.now() + 1,
          type: 'bot',
          content: "Received your message but couldn't generate a response.",
          timestamp: new Date(),
        }])
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || "Sorry, I'm having trouble connecting right now."
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: errorMsg,
        emoji: '⚠️',
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

  const handleOptionClick = async (opt: ChatOption) => {
    await sendMessage(opt.label)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full lg:w-96 bg-dark-800 border-l border-dark-700 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <FaRobot className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">AI Assistant</h3>
              <p className="text-xs text-gray-400">Defect Prediction Support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {initializing && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <FaRobot className="text-white text-sm" />
              </div>
              <div className="bg-dark-700 rounded-lg p-3 flex items-center gap-2">
                <FaSpinner className="animate-spin text-primary-400 text-sm" />
                <span className="text-gray-300 text-sm">Starting session...</span>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'bot' && (
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                  {message.emoji ? (
                    <span className="text-sm">{message.emoji}</span>
                  ) : (
                    <FaRobot className="text-white text-sm" />
                  )}
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 text-gray-100'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>

                {/* Friendly summary */}
                {message.friendlySummary && (
                  <div className="mt-2 text-xs text-gray-400 italic border-t border-dark-600 pt-2">
                    {message.friendlySummary}
                  </div>
                )}

                {/* Options */}
                {message.options && message.options.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {message.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(opt)}
                        disabled={loading}
                        className="text-left text-xs px-2.5 py-1.5 bg-dark-600 hover:bg-dark-500 text-primary-300 hover:text-primary-200 rounded-md transition-colors border border-dark-500 disabled:opacity-50"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-primary-100' : 'text-gray-400'
                  }`}
                >
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
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {quickReplies.length > 0 && !loading && (
          <div className="px-4 py-2 border-t border-dark-700/50 flex flex-wrap gap-1.5">
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(reply)}
                disabled={loading}
                className="text-xs px-2.5 py-1 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 rounded-full transition-colors border border-primary-500/20"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-dark-700 p-4 bg-dark-800">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about code metrics, risk levels..."
              className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              disabled={loading || initializing}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || initializing}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPaperPlane />
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
