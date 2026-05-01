'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { FaShieldAlt, FaSpinner } from 'react-icons/fa'
import { getMetrics } from '@/services/admin'
import type { MetricConfig } from '@/services/admin'

const mockMetrics: MetricConfig[] = [
  {
    id: 1,
    name: 'SHAP Threshold',
    description: 'Minimum SHAP value for feature importance',
    enabled: true,
    threshold: 0.1,
  },
  {
    id: 2,
    name: 'Complexity Threshold',
    description: 'Maximum cyclomatic complexity allowed',
    enabled: true,
    threshold: 10,
  },
  {
    id: 3,
    name: 'Risk Threshold',
    description: 'Defect probability threshold for high risk',
    enabled: true,
    threshold: 0.7,
  },
]

export default function MetricConfiguratorPage() {
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<MetricConfig[]>(mockMetrics)
  const [saved, setSaved] = useState(false)

  // Load metrics on mount
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await getMetrics()
        setMetrics(result.metrics)
      } catch (err) {
        console.error('Failed to load metrics:', err)
        setError('Failed to load metrics')
        // Keep mock data as fallback
        setMetrics(mockMetrics)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && user?.role === 'admin') {
      loadMetrics()
    }
  }, [isAuthenticated, user])

  // Wait for auth to load
  if (!isAuthenticated || !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full gap-3">
          <FaSpinner className="animate-spin text-primary-500" />
          <span className="text-gray-400">Loading...</span>
        </div>
      </DashboardLayout>
    )
  }

  // Only DBA can access
  if (user.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <FaShieldAlt className="text-6xl text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400">Only system administrators can access this page.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const handleSave = async () => {
    // In real app, this would save to backend
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Metric Configurator</h1>
          <p className="text-gray-400 mt-1">Set thresholds for SHAP and Complexity analysis</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-blue-400 flex items-center gap-2">
            <FaSpinner className="animate-spin" />
            <p>Loading metrics...</p>
          </div>
        )}

        <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50">
          <h2 className="text-xl font-semibold text-white mb-6">Configure Analysis Thresholds</h2>
          <div className="space-y-8 max-w-3xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  SHAP Threshold
                </label>
                <span className="text-lg font-bold text-primary-400">{metrics[0]?.threshold ?? 0.1}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue={metrics[0]?.threshold ?? 0.1}
                className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <p className="text-xs text-gray-400 mt-2">
                Features with SHAP values above this threshold will be flagged as high-risk drivers
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Complexity Threshold
                </label>
                <span className="text-lg font-bold text-primary-400">{metrics[1]?.threshold ?? 10}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                defaultValue={metrics[1]?.threshold ?? 10}
                className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <p className="text-xs text-gray-400 mt-2">
                Code with cyclomatic complexity above this value will be marked as high risk
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Risk Threshold
                </label>
                <span className="text-lg font-bold text-primary-400">{((metrics[2]?.threshold ?? 0.7) * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue={metrics[2]?.threshold ?? 0.7}
                onChange={(e) => {
                  const newMetrics = [...metrics]
                  if (newMetrics[2]) newMetrics[2].threshold = parseFloat(e.target.value)
                  setMetrics(newMetrics)
                }}
                className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <p className="text-xs text-gray-400 mt-2">
                Overall defect probability above this threshold will trigger critical alerts
              </p>
            </div>

            <div className="pt-4 border-t border-dark-700 flex items-center gap-4">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors"
              >
                Save Configuration
              </button>
              {saved && (
                <span className="text-green-400 text-sm font-medium">Configuration saved successfully!</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
