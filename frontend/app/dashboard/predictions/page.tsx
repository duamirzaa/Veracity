'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import Link from 'next/link'
import { FaChartLine, FaSpinner, FaInbox, FaChevronLeft, FaChevronRight, FaArrowLeft } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'
import { getPredictions } from '@/services/predictions'

export default function PredictionsPage() {
  const { user } = useAuth()
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getPredictions(page, limit)
        setPredictions(data.predictions || [])
        setTotal(data.total || 0)
        setTotalPages(data.page || Math.ceil((data.total || 0) / limit))
      } catch (err) {
        console.error('Failed to fetch predictions:', err)
        setError('Failed to load predictions')
        setPredictions([])
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchPredictions()
    }
  }, [user, page])

  const getRiskColors = (level: string) => {
    const riskColors: Record<string, { bg: string; text: string; border: string }> = {
      low: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
      medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
      high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
      critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    }
    return riskColors[level] || riskColors.medium
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-gray-400 hover:text-white" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">All Predictions</h1>
              <p className="text-gray-400 mt-1">
                {total > 0 ? `${total} prediction${total !== 1 ? 's' : ''} found` : 'View all analysis predictions'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 ml-4 text-sm underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Predictions List */}
        {loading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-dark-800/80 rounded-xl p-5 border border-dark-700/50 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-dark-600 rounded-xl"></div>
                    <div>
                      <div className="h-4 bg-dark-600 rounded w-48 mb-2"></div>
                      <div className="h-3 bg-dark-600 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-6 bg-dark-600 rounded-full w-24"></div>
                    <div className="h-4 bg-dark-600 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : predictions.length === 0 ? (
          <div className="bg-dark-800/80 rounded-xl p-16 border border-dark-700/50 border-dashed text-center">
            <FaInbox className="text-5xl text-dark-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No predictions yet</p>
            <p className="text-gray-500 text-sm mt-2">Upload a project and run an analysis to see predictions here</p>
            <Link
              href="/dashboard/projects"
              className="inline-block mt-6 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium"
            >
              Go to Projects
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {predictions.map((item) => {
                const riskLevel = (item.risk_level || 'medium').toLowerCase()
                const prob = Math.round((item.defect_probability ?? item.risk_score ?? 0) * 100)
                const colors = getRiskColors(riskLevel)
                const predId = item.id || item.prediction_id
                const timeStr = item.created_at ? formatDate(item.created_at) : ''

                return (
                  <Link
                    key={predId}
                    href={`/dashboard/predictions/${predId}`}
                    className="flex items-center justify-between p-5 bg-dark-800/80 rounded-xl hover:bg-dark-700/80 border border-dark-700/50 hover:border-primary-500/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-500/20 border border-primary-500/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FaChartLine className="text-primary-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{item.file_path || 'Unknown'}</p>
                        <p className="text-sm text-gray-400">{timeStr}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`px-3 py-1.5 ${colors.bg} ${colors.text} text-xs font-semibold rounded-full border ${colors.border} capitalize`}>
                        {riskLevel} Risk
                      </span>
                      <div className="text-right min-w-[60px]">
                        <p className="text-sm font-semibold text-white">{prob}%</p>
                        <p className="text-xs text-gray-500">probability</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-400">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg transition-colors text-sm"
                  >
                    <FaChevronLeft className="text-xs" />
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg transition-colors text-sm"
                  >
                    Next
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
