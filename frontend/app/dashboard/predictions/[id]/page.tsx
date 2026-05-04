'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import ChatbotPanel from '@/components/ChatbotPanel'
import { FaArrowLeft, FaComments, FaSpinner, FaLightbulb, FaRobot } from 'react-icons/fa'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Prediction } from '@/types/prediction'
import { predictionsService } from '@/services/predictions'
import MitigationAdvice from '@/components/MitigationAdvice'

// Mock prediction data - fallback only
const mockPredictionData: Prediction = {
  id: 1,
  project_id: 1,
  defect_probability: 0.75,
  risk_level: 'high',
  file_path: 'payment_processor.py',
  code_snippet: `def process_payment(user_id, amount, currency):
    """Process payment for user"""
    # High complexity function with multiple branches
    if amount <= 0:
        raise ValueError("Amount must be positive")
    
    if currency not in ['USD', 'EUR', 'GBP']:
        raise ValueError("Unsupported currency")
    
    user = get_user(user_id)
    if not user:
        raise ValueError("User not found")
    
    balance = get_balance(user_id)
    if balance < amount:
        raise ValueError("Insufficient funds")
    
    # Complex nested logic
    for transaction in get_recent_transactions(user_id):
        if transaction.status == 'pending':
            if transaction.amount > amount:
                process_refund(transaction.id)
            else:
                update_transaction(transaction.id, 'completed')
    
    return create_transaction(user_id, amount, currency)`,
  top_risk_features: [
    { feature_name: 'v(g)', shap_value: 0.15, feature_value: 12, impact: 'positive', abs_shap_value: 0.15 },
    { feature_name: 'loc', shap_value: 0.12, feature_value: 450, impact: 'positive', abs_shap_value: 0.12 },
    { feature_name: 'branchCount', shap_value: 0.10, feature_value: 25, impact: 'positive', abs_shap_value: 0.10 },
    { feature_name: 'num_functions', shap_value: 0.08, feature_value: 15, impact: 'positive', abs_shap_value: 0.08 },
    { feature_name: 'maintainability_index', shap_value: -0.05, feature_value: 45, impact: 'negative', abs_shap_value: 0.05 },
    { feature_name: 'num_classes', shap_value: 0.04, feature_value: 3, impact: 'positive', abs_shap_value: 0.04 },
    { feature_name: 'num_imports', shap_value: 0.03, feature_value: 8, impact: 'positive', abs_shap_value: 0.03 },
  ],
  metrics: {
    "loc": 450,
    'v(g)': 14,
    'ev(g)': 9.2,
    'iv(g)': 6.8,
    "n": 312,
    "v": 1840.5,
    "l": 0.02,
    "d": 58.3,
    "i": 31.5,
    "e": 107268,
    "b": 0.61,
    "t": 29.8,
    "locode": 420,
    "locomment": 30,
    "loblank": 0,
    "locodeandcomment": 0,
    "uniq_op": 0,
    "uniq_opnd": 0,
    "total_op": 0,
    "total_opnd": 0,
    "branchcount": 0,
    "cbo": 0,
    "rfc": 0,
    "v_density": 0,
    "cyclomatic_loc": 0,
    "halstead_difficulty": 0
  },
  created_at: '2024-01-15T10:30:00Z',
}

export default function PredictionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [prediction, setPrediction] = useState(mockPredictionData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chatbotOpen, setChatbotOpen] = useState(false)

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
        // Keep mock data as fallback
        setPrediction(mockPredictionData)
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          {error}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
            <span
              className={`px-4 py-2 rounded-lg border font-semibold ${getRiskColor(
                prediction.risk_level
              )}`}
            >
              {prediction.risk_level.toUpperCase()} RISK
            </span>
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

        {/* Mitigation Strategies */}
        {prediction.project_id ? (
          <MitigationAdvice projectId={prediction.project_id} />
        ) : (
          <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FaLightbulb className="text-yellow-400" />
              AI Mitigation Strategies
            </h2>

            {prediction.mitigation_advice && (typeof prediction.mitigation_advice === 'string' || Object.keys(prediction.mitigation_advice).length > 0) ? (
              <div className="space-y-4">
                {typeof prediction.mitigation_advice === 'string' ? (
                  <div className="text-gray-300 text-sm leading-relaxed bg-dark-700/30 p-4 rounded-lg border border-dark-600/50 italic">
                    {prediction.mitigation_advice}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(prediction.mitigation_advice).map(([key, value], idx) => {
                      if (!value) return null;

                      // Handle standard fields
                      if (key === 'message' || key === 'reply' || key === 'advice') {
                        return (
                          <div key={idx} className="text-gray-300 text-sm leading-relaxed bg-dark-700/30 p-4 rounded-lg border border-dark-600/50 italic">
                            {String(value)}
                          </div>
                        );
                      }

                      // Handle arrays (like messages or quick_replies)
                      if (Array.isArray(value)) {
                        if (key === 'quick_replies') {
                          return (
                            <div key={idx} className="mt-4">
                              <span className="text-xs font-bold text-gray-500 uppercase block mb-2 ml-1">Suggested Questions</span>
                              <div className="flex flex-wrap gap-2">
                                {value.map((reply: string, rIdx: number) => (
                                  <button
                                    key={rIdx}
                                    onClick={() => {
                                      setChatbotOpen(true);
                                    }}
                                    className="text-xs bg-dark-700 hover:bg-dark-600 text-primary-400 py-1.5 px-3 rounded-full border border-dark-600 transition-colors"
                                  >
                                    {reply}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={idx} className="space-y-2">
                            <span className="text-xs font-bold text-gray-500 uppercase block ml-1">{key}</span>
                            <ul className="space-y-3">
                              {value.map((item: any, iIdx: number) => {
                                // Extract text from potential message objects
                                let text = typeof item === 'string' ? item : (item.content || item.text || item.message || item.reply);
                                if (!text) return null;

                                // Handle dynamic risk level correction for system messages
                                if (item.type === 'system' && text.includes('HIGH RISK')) {
                                  const actualRisk = prediction.risk_level.toUpperCase();
                                  if (actualRisk !== 'HIGH') {
                                    text = text.replace('HIGH RISK', `${actualRisk} RISK`);
                                  }
                                }

                                return (
                                  <li key={iIdx} className="flex items-start gap-3 text-sm text-gray-300 bg-dark-700/20 p-3 rounded-lg border border-dark-600/30">
                                    <FaRobot className="text-primary-500 mt-0.5 flex-shrink-0" />
                                    <span>{text}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      }

                      // Handle generic key-value pairs (e.g., metric names)
                      return (
                        <div key={idx} className="bg-dark-700/30 p-4 rounded-lg border border-dark-600/50">
                          <span className="text-xs font-bold text-primary-400 uppercase mb-2 block">{key}</span>
                          <p className="text-sm text-gray-300 italic leading-relaxed">{String(value)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm mb-4">No specific mitigation strategies found for these metrics.</p>
                <button
                  onClick={() => setChatbotOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-primary-400 hover:text-primary-300 rounded-lg transition-colors border border-dark-600 text-sm"
                >
                  <FaComments />
                  Consult AI Assistant
                </button>
              </div>
            )}
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
    </DashboardLayout>
  )
}
