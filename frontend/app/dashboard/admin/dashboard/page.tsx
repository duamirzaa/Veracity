'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { FaShieldAlt, FaSpinner } from 'react-icons/fa'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { getAdminDashboard } from '@/services/admin'
import type { DashboardStats } from '@/services/admin'



export default function AnalysisDashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analysisDashboard, setAnalysisDashboard] = useState<DashboardStats | null>(null)

  // Load admin dashboard data on mount
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getAdminDashboard()
        setAnalysisDashboard(data)
      } catch (err) {
        console.error('Failed to load admin dashboard:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && user?.role === 'admin') {
      loadDashboard()
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analysis Dashboard</h1>
          <p className="text-gray-400 mt-1">Big picture overview of system-wide analysis metrics</p>
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
            <p>Loading dashboard data...</p>
          </div>
        )}

        {/* Big Picture Stats */}
        {analysisDashboard ? (
          <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50">
            <p className="text-sm text-gray-400 mb-2">Average Risk</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {(analysisDashboard.avgRisk * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">Across all projects</p>
          </div>
          <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50">
            <p className="text-sm text-gray-400 mb-2">Total Scans</p>
            <p className="text-4xl font-bold text-white">
              {analysisDashboard.totalScans.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-2">All time</p>
          </div>
          <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50">
            <p className="text-sm text-gray-400 mb-2">Successful</p>
            <p className="text-4xl font-bold text-green-400">
              {analysisDashboard.successfulScans.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {analysisDashboard.totalScans > 0 ? ((analysisDashboard.successfulScans / analysisDashboard.totalScans) * 100).toFixed(1) : '0.0'}% success rate
            </p>
          </div>
          <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50">
            <p className="text-sm text-gray-400 mb-2">Failed</p>
            <p className="text-4xl font-bold text-red-400">
              {analysisDashboard.failedScans.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {analysisDashboard.totalScans > 0 ? ((analysisDashboard.failedScans / analysisDashboard.totalScans) * 100).toFixed(1) : '0.0'}% failure rate
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={analysisDashboard.riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analysisDashboard.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Scan Trends</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={analysisDashboard.scanTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" opacity={0.3} />
                <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888' }} />
                <YAxis yAxisId="left" stroke="#888" tick={{ fill: '#888' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#888" tick={{ fill: '#888' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="scans"
                  stroke="#14a085"
                  strokeWidth={3}
                  name="Total Scans"
                  dot={{ fill: '#14a085', r: 5, strokeWidth: 2, stroke: '#0a5a4b' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgRisk"
                  stroke="#ff9500"
                  strokeWidth={3}
                  name="Avg Risk"
                  dot={{ fill: '#ff9500', r: 5, strokeWidth: 2, stroke: '#cc7700' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
          </>
        ) : !loading && !error && (
          <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-8 border border-dark-700/50 text-center">
            <p className="text-gray-400">No dashboard data available.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
