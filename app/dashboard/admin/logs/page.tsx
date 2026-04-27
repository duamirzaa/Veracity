'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSearch, FaDownload } from 'react-icons/fa'

// Mock scan logs data
const mockLogs = [
  {
    id: 1,
    timestamp: '2024-01-15T14:32:00Z',
    project: 'E-commerce Platform',
    files_scanned: 145,
    status: 'completed',
    defects_found: 23,
    duration: '2m 45s',
  },
  {
    id: 2,
    timestamp: '2024-01-15T13:15:00Z',
    project: 'API Gateway',
    files_scanned: 89,
    status: 'completed',
    defects_found: 12,
    duration: '1m 20s',
  },
  {
    id: 3,
    timestamp: '2024-01-15T12:00:00Z',
    project: 'Data Analytics',
    files_scanned: 234,
    status: 'completed',
    defects_found: 45,
    duration: '4m 10s',
  },
  {
    id: 4,
    timestamp: '2024-01-15T11:30:00Z',
    project: 'Payment Service',
    files_scanned: 56,
    status: 'failed',
    defects_found: 0,
    duration: '0m 30s',
  },
  {
    id: 5,
    timestamp: '2024-01-15T10:45:00Z',
    project: 'User Management',
    files_scanned: 178,
    status: 'completed',
    defects_found: 34,
    duration: '3m 15s',
  },
  {
    id: 6,
    timestamp: '2024-01-15T09:20:00Z',
    project: 'Notification Service',
    files_scanned: 102,
    status: 'completed',
    defects_found: 18,
    duration: '1m 50s',
  },
]

export default function ScanLogsPage() {
  const { user, isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [logs, setLogs] = useState(mockLogs)

  // Wait for auth to load
  if (!isAuthenticated || !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  // Only DBA can access
  if (user.role !== 'dba') {
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

  const filteredLogs = logs.filter(
    (log) =>
      log.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-400" />
      case 'failed':
        return <FaTimesCircle className="text-red-400" />
      case 'running':
        return <FaExclamationTriangle className="text-yellow-400 animate-spin" />
      default:
        return <FaCheckCircle className="text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400'
      case 'failed':
        return 'bg-red-500/20 text-red-400'
      case 'running':
        return 'bg-yellow-500/20 text-yellow-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
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

  const downloadLogs = () => {
    const csvContent = [
      ['ID', 'Timestamp', 'Project', 'Files Scanned', 'Status', 'Defects Found', 'Duration'],
      ...logs.map((log) => [
        log.id,
        log.timestamp,
        log.project,
        log.files_scanned,
        log.status,
        log.defects_found,
        log.duration,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `scan_logs_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Scan Logs</h1>
            <p className="text-gray-400 mt-1">View and monitor all code scan activities</p>
          </div>
          <button
            onClick={downloadLogs}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <FaDownload />
            Export CSV
          </button>
        </div>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl border border-dark-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Files Scanned</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Defects Found</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-dark-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{log.project}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-semibold">
                          {log.files_scanned}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            log.defects_found > 30
                              ? 'bg-red-500/20 text-red-400'
                              : log.defects_found > 15
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {log.defects_found}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">{log.duration}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)}`}>
                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No logs found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-dark-800 rounded-lg p-4 border border-dark-700">
            <p className="text-gray-400 text-sm mb-2">Total Scans</p>
            <p className="text-2xl font-bold text-white">{logs.length}</p>
          </div>
          <div className="bg-dark-800 rounded-lg p-4 border border-dark-700">
            <p className="text-gray-400 text-sm mb-2">Completed</p>
            <p className="text-2xl font-bold text-green-400">{logs.filter((l) => l.status === 'completed').length}</p>
          </div>
          <div className="bg-dark-800 rounded-lg p-4 border border-dark-700">
            <p className="text-gray-400 text-sm mb-2">Failed</p>
            <p className="text-2xl font-bold text-red-400">{logs.filter((l) => l.status === 'failed').length}</p>
          </div>
          <div className="bg-dark-800 rounded-lg p-4 border border-dark-700">
            <p className="text-gray-400 text-sm mb-2">Total Defects</p>
            <p className="text-2xl font-bold text-yellow-400">{logs.reduce((sum, l) => sum + l.defects_found, 0)}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
