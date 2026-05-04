'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaLightbulb, FaRobot, FaSpinner, FaExclamationTriangle, FaComments, FaArrowRight } from 'react-icons/fa'
import * as projectsService from '@/services/projects'
import type { MitigationStrategy, MitigationResponse } from '@/services/projects'

interface MitigationAdviceProps {
  projectId: number
}

export default function MitigationAdvice({ projectId }: MitigationAdviceProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<MitigationResponse | null>(null)

  useEffect(() => {
    const fetchMitigation = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await projectsService.getProjectMitigation(projectId)
        setData(result)
      } catch (err) {
        console.error('Failed to fetch mitigation advice:', err)
        setError('Failed to load mitigation strategies. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchMitigation()
    }
  }, [projectId])

  const handleRedirectToChat = (feature?: string) => {
    const query = feature ? `?projectId=${projectId}&feature=${encodeURIComponent(feature)}` : `?projectId=${projectId}`
    router.push(`/dashboard/chatbot${query}`)
  }

  if (loading) {
    return (
      <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-8 border border-dark-700/50 flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <FaSpinner className="text-3xl text-primary-500 animate-spin" />
        <p className="text-gray-400 animate-pulse text-sm">Analyzing defect risk patterns...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <FaExclamationTriangle className="text-2xl text-red-400 mx-auto mb-3" />
        <p className="text-red-400 text-sm font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-xs font-semibold"
        >
          Retry Fetching
        </button>
      </div>
    )
  }

  if (!data || (!data.has_advice && (!data.strategies || data.strategies.length === 0))) {
    return (
      <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-10 border border-dark-700/50 text-center">
        <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-500/20">
          <FaRobot className="text-3xl text-primary-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No Strategies Found</h3>
        <p className="text-gray-400 mb-6 text-sm max-w-md mx-auto">
          We couldn't find specific mitigation strategies for this project's current risk profile.
        </p>
        <button
          onClick={() => handleRedirectToChat()}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all text-sm font-semibold shadow-lg shadow-primary-500/20 hover:-translate-y-0.5"
        >
          <FaComments />
          Consult AI Assistant
        </button>
      </div>
    )
  }

  // If general advice is false, show the global CTA
  if (!data.has_advice) {
    return (
      <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl p-8 border border-primary-500/30 shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/10 blur-[100px] rounded-full group-hover:bg-primary-500/20 transition-all duration-700"></div>
        
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-primary-500/20 rounded-3xl flex items-center justify-center mb-6 border border-primary-500/40 shadow-inner">
            <FaRobot className="text-4xl text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3 tracking-tight">Personalized Mitigation Required</h2>
          <p className="text-gray-400 mb-8 text-sm max-w-lg leading-relaxed">
            Standard strategies aren't enough for this project's unique complexity. Connect with <span className="text-primary-400 font-bold">Vera</span>, our specialized AI agent, to generate a tailored fix plan.
          </p>
          <button
            onClick={() => handleRedirectToChat()}
            className="group/btn inline-flex items-center gap-3 px-8 py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-all text-sm font-bold shadow-xl shadow-primary-500/30 hover:scale-105 active:scale-95"
          >
            <FaComments className="text-lg" />
            <span>Consult AI Assistant</span>
            <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-dark-700/50 pb-2 mb-1">
        <h2 className="text-[13px] font-bold text-white flex items-center gap-2">
          <FaLightbulb className="text-yellow-400 text-xs" />
          Mitigation Strategies
        </h2>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-medium text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
            System Analysis
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        {data.strategies.map((strategy, index) => (
          <div 
            key={index}
            className="group bg-dark-800/40 backdrop-blur-sm rounded-lg border border-dark-700/40 p-3 hover:bg-dark-800/60 transition-all duration-200"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-dark-700/50 rounded flex items-center justify-center border border-dark-600/50 text-primary-400 text-[11px] font-bold">
                  {index + 1}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[13px] font-bold text-white group-hover:text-primary-400 transition-colors">
                    {strategy.feature_name}
                  </h3>
                  {!strategy.has_advice && (
                     <button
                        onClick={() => handleRedirectToChat(strategy.feature_name)}
                        className="flex items-center gap-1.5 text-[11px] text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                      >
                        <FaRobot className="text-xs" />
                        Ask AI
                      </button>
                  )}
                </div>
                
                {strategy.has_advice ? (
                  <div className="flex items-start gap-2 text-[12px] text-gray-400">
                    <FaRobot className="text-primary-500 mt-0.5 flex-shrink-0 text-[11px]" />
                    <p className="leading-relaxed">
                      {strategy.mitigation_advice}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-[11px]">
                    No automated advice available.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-dark-800/20 rounded-lg p-2 border border-dark-700/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <FaRobot className="text-primary-500" />
          <span>Seeking deeper insights? Unlock advanced strategies with Vera AI.</span>
        </div>
        <button 
           onClick={() => handleRedirectToChat()}
           className="text-[11px] font-semibold text-primary-400 hover:text-primary-300 transition-colors"
        >
          Start Session
        </button>
      </div>
    </div>
  )
}
