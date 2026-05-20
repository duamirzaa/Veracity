'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import ChatbotPanel from '@/components/ChatbotPanel'
import RefactorModal from '@/components/RefactorModal'
import { FaArrowLeft, FaComments, FaSpinner, FaLightbulb, FaRobot, FaDownload, FaMagic } from 'react-icons/fa'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Prediction } from '@/types/prediction'
import { predictionsService } from '@/services/predictions'
import MitigationAdvice from '@/components/MitigationAdvice'
import { useAuth } from '@/contexts/AuthContext'
import { downloadReport } from '@/services/reports'





export default function PredictionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chatbotOpen, setChatbotOpen] = useState(false)

  const [refactorModalOpen, setRefactorModalOpen] = useState(false)
  const [downloadingReport, setDownloadingReport] = useState(false)
  const { user } = useAuth()

  const handleDownloadReport = async () => {
    if (!prediction) return
    try {
      setDownloadingReport(true)
      setError(null)
      
      const isAllowed = user?.role === 'admin' || user?.role === 'project_manager' || user?.role === 'student' || user?.tier === 'pro'
      const format = isAllowed ? 'pdf' : 'json'
      
      const blob = await downloadReport(
        format,
        user?.role || 'user',
        user?.tier || 'free',
        prediction.project_id || prediction.id,
        user?.id
      )

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report_${prediction.project_id || 'analysis'}_${Date.now()}.${format}`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Failed to download report:', err)
      if (err.response?.status === 403) {
        window.dispatchEvent(new CustomEvent('upgrade-required'))
      } else {
        setError('Failed to download report. Please try again.')
      }
    } finally {
      setDownloadingReport(false)
    }
  }

  const handleImproveCodeClick = () => {
    const isAllowed = user?.role === 'admin' || user?.role === 'project_manager' || user?.role === 'student' || user?.tier === 'pro'
    if (!isAllowed) {
      window.dispatchEvent(new CustomEvent('upgrade-required'))
    } else {
      setRefactorModalOpen(true)
    }
  }

  useEffect(() => {
    const loadPrediction = async () => {
      try {
        setLoading(true)
        setError(null)
        if (typeof params.id === 'string') {
          const pred = await predictionsService.getPredictionById(parseInt(params.id))
          setPrediction(pred)
        }
      } catch (err) {
        console.error('Failed to load prediction:', err)
        setError('Failed to load prediction details')
      } finally {
        setLoading(false)
      }
    }

    loadPrediction()
  }, [params.id])

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      default:
        return 'bg-green-500/20 text-green-400 border-green-500/50'
    }
  }


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 gap-3">
          <FaSpinner className="animate-spin text-primary-500 text-xl" />
          <span className="text-gray-400">Loading prediction details...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !prediction) {
    return (
      <DashboardLayout>
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          {error || 'Prediction not found'}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-gray-400 hover:text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Analysis Results</h1>
              <p className="text-gray-400 mt-1">{prediction.file_path}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-lg border font-semibold ${getRiskColor(
                prediction.risk_level
              )}`}
            >
              {prediction.risk_level.toUpperCase()} RISK
            </span>
            <button
              onClick={() => setChatbotOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              <FaComments />
              Chatbot Support
            </button>
          </div>
        </div>

        {/* Prediction Summary - Same as Analysis Page */}
        <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-dark-700/50">
            <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${getRiskColor(
                  prediction.risk_level
                )}`}
              >
                {prediction.risk_level.toUpperCase()} RISK
              </span>
              
              {/* Download Report Button */}
              <button
                onClick={handleDownloadReport}
                disabled={downloadingReport}
                className="flex items-center gap-2 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg border border-dark-600 transition-all text-xs font-semibold disabled:opacity-50"
              >
                {downloadingReport ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <FaDownload className="text-xs" />
                    <span>Download Report</span>
                  </>
                )}
              </button>

              {/* Improve Code Button */}
              <button
                onClick={handleImproveCodeClick}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-primary-500 to-primary-400 hover:from-primary-600 hover:to-primary-500 text-dark-900 rounded-lg font-bold transition-all text-xs shadow-md shadow-primary-500/10 hover:shadow-lg hover:shadow-primary-500/20 hover:-translate-y-0.5"
              >
                <FaMagic className="text-xs animate-pulse" />
                <span>Improve Code</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dark-700/50 rounded-lg p-4 border border-dark-600/50">
              <p className="text-sm text-gray-400 mb-1">Defect Probability</p>
              <p className="text-3xl font-bold text-white">
                {(prediction.defect_probability * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-dark-700/50 rounded-lg p-4 border border-dark-600/50">
              <p className="text-sm text-gray-400 mb-1">Risk Level</p>
              <p className="text-3xl font-bold text-white capitalize">{prediction.risk_level}</p>
            </div>
            <div className="bg-dark-700/50 rounded-lg p-4 border border-dark-600/50">
              <p className="text-sm text-gray-400 mb-1">File</p>
              <p className="text-lg font-semibold text-white">{prediction.file_path || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* SHAP Features - Same as Analysis Page */}
        <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">Top Risk-Driving Features (SHAP)</h2>
          <div className="space-y-3">
            {prediction.top_risk_features.map((feature, index: number) => (
              <div
                key={index}
                className="bg-dark-700/50 rounded-lg p-4 flex items-center justify-between border border-dark-600/50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${feature.impact === 'positive'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                      }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{feature.feature_name}</p>
                    <p className="text-sm text-gray-400">Value: {feature.feature_value}</p>
                    {feature.mitigation_advice && (
                      <div className="mt-2 text-xs text-primary-300 bg-primary-500/10 py-1.5 px-3 rounded-md border border-primary-500/20 max-w-sm lg:max-w-md italic">
                        {feature.mitigation_advice}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${feature.shap_value > 0 ? 'text-red-400' : 'text-green-400'
                      }`}
                  >
                    {feature.shap_value > 0 ? '+' : ''}
                    {feature.shap_value.toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-400">SHAP Value</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mitigation Strategies — always from backend */}
        {prediction.project_id ? (
          <MitigationAdvice projectId={prediction.project_id} />
        ) : (
          <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FaLightbulb className="text-yellow-400" />
              Mitigation Strategies
            </h2>
            <div className="text-center py-6">
              <FaRobot className="text-4xl text-primary-500/40 mx-auto mb-4" />
              <p className="text-gray-400 text-sm mb-2">No project context available for automated strategies.</p>
              <p className="text-gray-500 text-xs mb-6">Consult the AI assistant for personalized mitigation advice based on your analysis results.</p>
              <button
                onClick={() => setChatbotOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm font-semibold shadow-lg shadow-primary-500/20"
              >
                <FaComments />
                Get AI Mitigation Advice
              </button>
            </div>
          </div>
        )}

        {/* Code Display - Same as Analysis Page */}

        {/* Chatbot Support */}
        <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Need Help?</h2>
              <p className="text-gray-400">Get mitigation strategies and advice from our AI chatbot</p>
            </div>
            <button
              onClick={() => setChatbotOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-semibold"
            >
              <FaComments />
              Open Chatbot
            </button>
          </div>
        </div>
      </div>

      {/* Chatbot Panel */}
      <ChatbotPanel
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
        projectId={prediction.id}
        risk_level={prediction.risk_level}
        top_features={prediction.top_risk_features}
      />

      {/* Refactor Modal */}
      {(prediction.project_id || prediction.id) && (
        <RefactorModal
          isOpen={refactorModalOpen}
          onClose={() => setRefactorModalOpen(false)}
          projectId={prediction.project_id || prediction.id}
          originalCode={prediction.code_snippet || ''}
          fileName={prediction.file_path || 'analysis.py'}
        />
      )}
    </DashboardLayout>
  )
}
