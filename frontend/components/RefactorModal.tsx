'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaTimes, FaSpinner, FaMagic, FaDownload, 
  FaRobot, FaCheckCircle, FaExclamationTriangle, 
  FaChevronRight, FaCode, FaChartLine, FaCopy
} from 'react-icons/fa'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import * as projectsService from '@/services/projects'
import type { RefactorResponse } from '@/services/projects'

interface RefactorModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  originalCode: string
  fileName?: string
}

export default function RefactorModal({ 
  isOpen, 
  onClose, 
  projectId, 
  originalCode,
  fileName = 'analysis.py'
}: RefactorModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<'rate_limit' | 'server' | 'forbidden' | null>(null)
  const [data, setData] = useState<RefactorResponse | null>(null)

  const [copiedOriginal, setCopiedOriginal] = useState(false)
  const [copiedImproved, setCopiedImproved] = useState(false)

  useEffect(() => {
    if (isOpen && projectId && !data && !loading) {
      triggerRefactoring()
    }
  }, [isOpen, projectId])

  const triggerRefactoring = async () => {
    try {
      setLoading(true)
      setError(null)
      setErrorType(null)
      
      const response = await projectsService.refactorProjectCode(projectId)
      console.log("REFACTOR ENDPOINT FULL RESPONSE DATA:", response)
      setData(response)
    } catch (err: any) {
      console.error('Code improvement failed:', err)
      const status = err.response?.status
      const responseData = err.response?.data
      
      if (status === 403 && responseData?.upgrade_required) {
        setErrorType('forbidden')
        setError('Upgrade to Pro to use Code Improvement feature')
        // Dispatch window event so core DashboardLayout opens standard upgrade modal
        window.dispatchEvent(new CustomEvent('upgrade-required'))
        onClose()
      } else if (status === 429) {
        setErrorType('rate_limit')
        setError('AI rate limit reached. Please wait a moment.')
      } else {
        setErrorType('server')
        setError('Failed to generate improved code. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Copy code blocks
  const handleCopyOriginal = () => {
    const codeToCopy = data?.original_code || originalCode
    navigator.clipboard.writeText(codeToCopy)
    setCopiedOriginal(true)
    setTimeout(() => setCopiedOriginal(false), 2000)
  }

  const handleCopyImproved = () => {
    if (!data?.improved_code) return
    navigator.clipboard.writeText(data.improved_code)
    setCopiedImproved(true)
    setTimeout(() => setCopiedImproved(false), 2000)
  }

  // Action to download improved code
  const handleDownloadCode = () => {
    if (!data?.improved_code) return
    
    const blob = new Blob([data.improved_code], { type: 'text/x-python;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Use original file name but add _improved
    const nameParts = fileName.split('.')
    const downloadName = nameParts.length > 1 
      ? `${nameParts.slice(0, -1).join('.')}_improved.${nameParts[nameParts.length - 1]}`
      : `${fileName}_improved.py`

    link.setAttribute('download', downloadName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Dynamically correct the LOC lines count based on actual code length
  const getCorrectedMetrics = () => {
    const rawMetrics = data?.metrics_estimate || ''
    const lines = rawMetrics.split('\n')
    const totalLinesCount = data?.improved_code ? data.improved_code.split('\n').length : 0
    
    const correctedLines = lines.map(line => {
      const lower = line.toLowerCase()
      if (lower.includes('loc') || lower.includes('lines of code') || lower.includes('line count')) {
        // Correct the line count!
        if (line.includes('→')) {
          const parts = line.split('→')
          const beforePart = parts[0]
          if (parts[1].toLowerCase().includes('after')) {
            return `${beforePart} → After: ${totalLinesCount}`
          } else {
            return `${beforePart} → ${totalLinesCount}`
          }
        }
        
        if (line.includes(':')) {
          const idxOfColon = line.indexOf(':')
          const label = line.substring(0, idxOfColon)
          const val = line.substring(idxOfColon + 1)
          
          if (val.toLowerCase().includes('before') || val.toLowerCase().includes('after')) {
            if (val.includes('After:')) {
              const idxOfAfter = val.indexOf('After:')
              return `${label}: ${val.substring(0, idxOfAfter)}After: ${totalLinesCount}`
            }
          }
          return `${label}: ${totalLinesCount}`
        }
      }
      return line
    })
    
    return correctedLines.join('\n')
  }

  // Parse metrics to show clean pills
  const parseMetrics = (metricsString: string) => {
    if (!metricsString) return []
    // Split by newlines, commas, or semicolons
    return metricsString
      .split(/[\n,;]+/)
      .map(item => item.trim())
      .filter(Boolean)
  }

  // Parse explanations to bullet lists
  const parseExplanations = (expString: string) => {
    if (!expString) return []
    return expString
      .split('\n')
      .map(line => line.replace(/^[\s-*•·]+/, '').trim())
      .filter(Boolean)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Dark Glassmorphic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          className="relative w-full max-w-7xl bg-dark-900 border border-dark-700/60 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-dark-800/80 bg-dark-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                <FaMagic className="text-primary-500 text-lg animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  AI Code Improvement
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 font-semibold border border-primary-500/20">PRO</span>
                </h2>
                <p className="text-xs text-gray-400">Optimize and refactor risk-prone sections dynamically</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-dark-800 hover:bg-dark-700 border border-dark-700/50 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* 1. Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-20 h-20 bg-primary-500/15 rounded-full blur-xl animate-pulse"></div>
                  <FaSpinner className="text-4xl text-primary-500 animate-spin relative z-10" />
                </div>
                <div className="text-center space-y-2 max-w-md">
                  <h3 className="text-white font-bold tracking-wide">Refactoring in progress...</h3>
                  <p className="text-sm text-gray-400 animate-pulse">
                    AI is analyzing and improving your code...
                  </p>
                </div>
              </div>
            )}

            {/* 2. Error State */}
            {error && !loading && (
              <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-6 max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                  <FaExclamationTriangle className="text-2xl text-red-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-bold text-lg">Code Improvement Failed</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{error}</p>
                </div>
                {errorType !== 'forbidden' && (
                  <button
                    onClick={triggerRefactoring}
                    className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm font-semibold shadow-lg shadow-primary-500/20"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}

            {/* 3. Success State */}
            {data && !loading && !error && (
              <div className="space-y-6">
                {/* Visual side-by-side editor */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[260px] lg:h-[280px]">
                  
                  {/* Left Column: Original Code */}
                  <div className="flex flex-col bg-dark-950 rounded-xl border border-dark-800/80 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-dark-800/80 bg-dark-900/50">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                        <FaCode />
                        <span>Original Code</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={handleCopyOriginal}
                          className="flex items-center gap-1.5 px-2 py-1 bg-dark-800 hover:bg-dark-700 rounded border border-dark-700/50 text-[10px] text-gray-400 hover:text-white transition-colors font-semibold shadow-sm"
                          title="Copy Original Code"
                        >
                          {copiedOriginal ? <FaCheckCircle className="text-green-400 text-xs" /> : <FaCopy className="text-xs" />}
                          <span>{copiedOriginal ? 'Copied' : 'Copy'}</span>
                        </button>
                        <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-mono">
                          Defective
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto text-sm font-mono p-1">
                      <SyntaxHighlighter
                        language="python"
                        style={vscDarkPlus}
                        showLineNumbers
                        customStyle={{
                          background: 'transparent',
                          padding: '1rem',
                          margin: 0,
                          fontSize: '0.85rem',
                          height: '100%',
                        }}
                      >
                        {data.original_code || originalCode}
                      </SyntaxHighlighter>
                    </div>
                  </div>

                  {/* Right Column: Improved Code */}
                  <div className="flex flex-col bg-dark-950 rounded-xl border border-primary-500/25 overflow-hidden ring-1 ring-primary-500/10 shadow-lg shadow-primary-500/5">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-dark-800/80 bg-dark-900/50">
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary-400">
                        <FaMagic />
                        <span>Improved Code</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={handleCopyImproved}
                          className="flex items-center gap-1.5 px-2 py-1 bg-dark-800 hover:bg-dark-700 rounded border border-dark-700/50 text-[10px] text-gray-400 hover:text-white transition-colors font-semibold shadow-sm"
                          title="Copy Improved Code"
                        >
                          {copiedImproved ? <FaCheckCircle className="text-green-400 text-xs" /> : <FaCopy className="text-xs" />}
                          <span>{copiedImproved ? 'Copied' : 'Copy'}</span>
                        </button>
                        <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                          Optimized
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto text-sm font-mono p-1">
                      <SyntaxHighlighter
                        language="python"
                        style={vscDarkPlus}
                        showLineNumbers
                        customStyle={{
                          background: 'transparent',
                          padding: '1rem',
                          margin: 0,
                          fontSize: '0.85rem',
                          height: '100%',
                        }}
                      >
                        {data.improved_code}
                      </SyntaxHighlighter>
                    </div>
                  </div>

                </div>

                {/* Analytical Summary (Bottom Half) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Explanations Section */}
                  <div className="bg-dark-800/50 rounded-xl border border-dark-700/40 p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FaRobot className="text-primary-400" />
                      What Changed Under the Hood
                    </h3>
                    
                    <div className="space-y-2">
                      {parseExplanations(data.explanation).map((bullet, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-dark-900/45 p-3 rounded-lg border border-dark-800/50">
                          <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0 text-sm" />
                          <span className="text-xs text-gray-300 leading-relaxed font-medium">
                            {bullet}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics Section */}
                  <div className="bg-dark-800/50 rounded-xl border border-dark-700/40 p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <FaChartLine className="text-yellow-400" />
                        Estimated Metrics Improvement
                      </h3>
                      
                      <div className="grid gap-3">
                        {parseMetrics(getCorrectedMetrics()).map((metric, idx) => {
                          const hasArrow = metric.includes('→');
                          const hasColon = metric.includes(':');
                          
                          if (hasArrow) {
                            const parts = metric.split('→');
                            const labelPart = parts[0].split(':');
                            const label = labelPart.length > 1 ? labelPart[0].trim() : 'Metric';
                            const before = labelPart.length > 1 ? labelPart[1].trim() : parts[0].trim();
                            const after = parts[1].trim();

                            return (
                              <div key={idx} className="bg-dark-900/45 border border-dark-800 p-3.5 rounded-lg flex items-center justify-between">
                                <span className="text-xs font-bold text-white">{label.replace(/[\*]+/g, '').trim()}</span>
                                <div className="flex items-center gap-2 font-mono">
                                  <span className="text-xs text-gray-500 line-through">{before.replace(/[\*]+/g, '').trim()}</span>
                                  <FaChevronRight className="text-[10px] text-gray-600" />
                                  <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                    {after.replace(/[\*]+/g, '').trim()}
                                  </span>
                                </div>
                              </div>
                            )
                          }
                          
                          if (hasColon) {
                            const idxOfColon = metric.indexOf(':');
                            const label = metric.substring(0, idxOfColon).trim();
                            const val = metric.substring(idxOfColon + 1).trim();
                            
                            const cleanLabel = label.replace(/[\*]+/g, '').trim();
                            const cleanVal = val.replace(/[\*]+/g, '').trim();

                            return (
                              <div key={idx} className="bg-dark-900/45 border border-dark-800 p-3.5 rounded-lg flex items-center justify-between">
                                <span className="text-xs font-bold text-white">{cleanLabel}</span>
                                <span className="text-xs font-semibold text-primary-400 font-mono">{cleanVal}</span>
                              </div>
                            )
                          }

                          // Raw fallback with zero duplicates
                          return (
                            <div key={idx} className="bg-dark-900/45 border border-dark-800 p-3.5 rounded-lg text-left">
                              <span className="text-xs font-medium text-gray-300">{metric.replace(/[\*]+/g, '').trim()}</span>
                            </div>
                          )
                        })}

                        {/* Dynamic Extra Endpoint Properties Display */}
                        {Object.entries(data).map(([key, val]) => {
                          if (['original_code', 'improved_code', 'explanation', 'metrics_estimate', 'project_id', 'project_name', 'generated_at'].includes(key)) {
                            return null
                          }
                          
                          let displayVal = ''
                          if (typeof val === 'object' && val !== null) {
                            displayVal = JSON.stringify(val, null, 2)
                          } else {
                            displayVal = String(val)
                          }
                          
                          if (!displayVal || displayVal.trim() === '') return null
                          const cleanKey = key.replace(/_/g, ' ').toUpperCase()
                          
                          return (
                            <div key={key} className="bg-dark-900/45 border border-dark-800 p-3.5 rounded-lg flex flex-col gap-1.5 text-left">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{cleanKey}</span>
                              <span className="text-xs font-semibold text-white font-mono whitespace-pre-wrap">{displayVal}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-500 flex items-center gap-2 pt-2 border-t border-dark-800/60">
                      <FaCheckCircle className="text-green-500" />
                      <span>Refactoring strictly aligns with cyclomatic and Halstead risk patterns.</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* Footer Action Bar */}
          <div className="px-6 py-4 border-t border-dark-800/80 bg-dark-800/40 flex items-center justify-between gap-4">
            <span className="text-xs text-gray-500 font-mono hidden sm:inline">
              {data ? `Generated at: ${new Date(data.generated_at).toLocaleString()}` : ''}
            </span>
            <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
              <button
                onClick={onClose}
                className="w-1/2 sm:w-auto px-5 py-2.5 bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-white rounded-lg transition-colors text-sm font-semibold border border-dark-700/50"
              >
                Close View
              </button>
              {data && (
                <button
                  onClick={handleDownloadCode}
                  className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-dark-900 rounded-lg transition-all text-sm font-bold shadow-lg shadow-primary-500/25 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <FaDownload />
                  <span>Download Code</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
