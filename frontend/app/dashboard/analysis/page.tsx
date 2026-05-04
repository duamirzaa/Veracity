'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import ChatbotPanel from '@/components/ChatbotPanel'
import { FaUpload, FaGithub, FaCode, FaExclamationTriangle, FaCheckCircle, FaFile, FaComments, FaSpinner, FaRobot, FaLightbulb, FaPlus } from 'react-icons/fa'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Prediction } from '@/types/prediction'
import * as predictionsService from '@/services/predictions'
import * as projectsService from '@/services/projects'
import { startChat } from '@/services/chatbot'
import { getErrorMessage } from '@/utils/error-handler'
import MitigationAdvice from '@/components/MitigationAdvice'

function AnalysisContent() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')

  const [code, setCode] = useState('')
  const [filePath, setFilePath] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [activeTab, setActiveTab] = useState<'input' | 'results'>('input')
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [chatbotOpen, setChatbotOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper to ensure mitigation advice is present
  const ensureAdvice = async (pred: Prediction) => {
    if (!pred.mitigation_advice || (typeof pred.mitigation_advice === 'object' && Object.keys(pred.mitigation_advice).length === 0)) {
      try {
        const chatData = await startChat(projectId || pred.id, pred.risk_level, pred.top_risk_features);
        if (chatData.conversation) {
          pred.mitigation_advice = chatData.conversation;
        }
      } catch (err) {
        console.warn('Silent advice fetch failed:', err);
      }
    }
    return pred;
  };

  // Load project data if projectId is provided
  useEffect(() => {
    const loadProjectData = async () => {
      if (!projectId) return

      try {
        setLoading(true)
        setError(null)
        const project = await projectsService.getProjectById(parseInt(projectId))
        if (project.latest_prediction_id) {
          let pred = await predictionsService.getPredictionById(project.latest_prediction_id)
          pred = await ensureAdvice(pred);
          setPrediction(pred)
          setActiveTab('results')
        }
      } catch (err) {
        console.error('Failed to load project data:', err)
        setError('Failed to load project data')
      } finally {
        setLoading(false)
      }
    }

    loadProjectData()
  }, [projectId])

  const handleNewAnalysis = () => {
    setCode('')
    setFilePath('')
    setPrediction(null)
    setActiveTab('input')
    setError(null)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type === 'text/x-python' || file.name.endsWith('.py'))) {
      setFilePath(file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setCode(content)
      }
      reader.readAsText(file)
    } else {
      setError('Please select a valid Python file')
    }
  }

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please provide code to analyze')
      return
    }

    setAnalyzing(true)
    setAnalysisProgress(0)
    setCurrentStep('Initializing analysis...')
    setError(null)

    // Simulate real-time analysis progress
    const steps = [
      { progress: 20, step: 'Parsing code structure...' },
      { progress: 40, step: 'Extracting code metrics...' },
      { progress: 60, step: 'Calculating complexity...' },
      { progress: 80, step: 'Running ML model...' },
      { progress: 90, step: 'Generating SHAP explanations...' },
      { progress: 100, step: 'Analysis complete!' },
    ]

    try {
      for (const { progress, step } of steps) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        setAnalysisProgress(progress)
        setCurrentStep(step)
      }

      // Submit to backend
      const result = await predictionsService.analyzeCode({
        code,
        file_path: filePath || 'analysis.py',
        project_id: projectId ? parseInt(projectId) : undefined,
      })

      const finalPrediction = await ensureAdvice(result.prediction);
      setPrediction(finalPrediction)
      setActiveTab('results')
    } catch (err: any) {
      console.error('Analysis failed:', err)
      setError(getErrorMessage(err, 'Analysis failed. Please try again.'))
      setPrediction(null)
    } finally {
      setAnalyzing(false)
      setAnalysisProgress(0)
      setCurrentStep('')
    }
  }

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Code Analysis</h1>
            <p className="text-gray-400 mt-1">Analyze Python code for potential defects</p>
          </div>
          {prediction && !projectId && (
            <button
              onClick={handleNewAnalysis}
              className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg border border-dark-600 transition-all text-sm font-semibold"
            >
              <FaPlus />
              New Analysis
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-dark-700">
          {!prediction && (
            <button
              onClick={() => setActiveTab('input')}
              className={`px-4 py-2 font-medium transition-colors ${activeTab === 'input'
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              Code Input
            </button>
          )}
          {prediction && (
            <button
              onClick={() => setActiveTab('results')}
              className={`px-4 py-2 font-medium transition-colors ${activeTab === 'results'
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              Analysis Results
            </button>
          )}
        </div>

        {/* Error and Loading States */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-400">
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 text-blue-400 flex items-center gap-2">
            <FaSpinner className="animate-spin" />
            <p>Loading project data...</p>
          </div>
        )}

        {activeTab === 'input' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Code Input */}
            <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Python Code</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-dark-700/50 hover:bg-dark-600 border border-dark-600/50 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    <FaUpload />
                  </button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".py,text/x-python"
                onChange={handleFileUpload}
                className="hidden"
              />
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your Python code here or upload a file..."
                className="w-full h-96 px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {code && (
                <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                  <FaFile className="text-primary-500" />
                  <span>{code.split('\n').length} lines of code</span>
                </div>
              )}

              {/* Real-time Analysis Progress */}
              {analyzing && (
                <div className="mt-4 p-4 bg-dark-700/50 rounded-lg border border-primary-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{currentStep}</span>
                    <span className="text-sm text-primary-400 font-semibold">{analysisProgress}%</span>
                  </div>
                  <div className="w-full bg-dark-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${analysisProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!code.trim() || analyzing}
                className="w-full mt-4 bg-gradient-to-r from-primary-500 to-primary-400 hover:from-primary-600 hover:to-primary-500 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 hover:shadow-xl"
              >
                {analyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </span>
                ) : (
                  'Analyze Code'
                )}
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50">
              <h2 className="text-lg font-semibold text-white mb-4">How to Use</h2>
              <div className="space-y-4 text-gray-400">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-400 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Paste Code</h3>
                    <p className="text-sm">Copy and paste your Python code into the editor</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-400 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Upload File</h3>
                    <p className="text-sm">Click the upload button to select a Python (.py) file</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-400 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Connect GitHub</h3>
                    <p className="text-sm">Connect your GitHub repository for automatic analysis</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-400 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Analyze</h3>
                    <p className="text-sm">Click Analyze Code to get real-time defect predictions and SHAP insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          prediction && (
            <div className="space-y-6">
              {/* Prediction Summary */}
              <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Analysis Results</h2>
                  <span
                    className={`px-4 py-2 rounded-lg border font-semibold ${getRiskColor(
                      prediction.risk_level
                    )}`}
                  >
                    {prediction.risk_level.toUpperCase()} RISK
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-dark-700 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Defect Probability</p>
                    <p className="text-3xl font-bold text-white">
                      {(prediction.defect_probability * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Risk Level</p>
                    <p className="text-3xl font-bold text-white capitalize">{prediction.risk_level}</p>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">File</p>
                    <p className="text-lg font-semibold text-white">{prediction.file_path || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* SHAP Features */}
              <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50">
                <h2 className="text-lg font-semibold text-white mb-4">Top Risk-Driving Features (SHAP)</h2>
                <div className="space-y-3">
                  {prediction.top_risk_features.map((feature, index: number) => (
                    <div
                      key={index}
                      className="bg-dark-700 rounded-lg p-4 flex items-center justify-between"
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
              {projectId ? (
                <MitigationAdvice projectId={parseInt(projectId)} />
              ) : (
                <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
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


              {/* Chatbot Support */}
              {projectId && (
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
              )}
            </div>
          )
        )}
      </div>

      {/* Chatbot Panel */}
      <ChatbotPanel
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
        projectId={projectId ? parseInt(projectId) : prediction?.id}
        risk_level={prediction?.risk_level}
        top_features={prediction?.top_risk_features}
      />
    </DashboardLayout>
  )
}
export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="text-white p-8">Loading...</div>}>
      <AnalysisContent />
    </Suspense>
  )
}