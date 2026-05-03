'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { FaShieldAlt, FaSearch, FaSpinner, FaChevronLeft, FaChevronRight, FaFilter } from 'react-icons/fa'
import { getLogs, ScanLog } from '@/services/admin'

export default function ScanLogsPage() {
  const { user, isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [logs, setLogs] = useState<ScanLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 15

  const loadLogs = async (currentPage: number) => {
    try {
      setLoading(true)
      setError(null)
      const result = await getLogs(currentPage, limit)
      setLogs(result.logs)
      setTotalPages(Math.ceil(result.total / limit))
    } catch (err) {
      console.error('Failed to load logs:', err)
      setError('Failed to load audit logs.')
    } finally {
      setLoading(false)
    }
  }

  // Load logs on mount and when page changes
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadLogs(page)
    }
  }, [isAuthenticated, user, page])

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

  // Only Admin can access
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

  const filteredLogs = logs.filter(
    (log) =>
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address.includes(searchTerm)
  )

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
        return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'FAILED':
        return 'bg-red-500/20 text-red-400 border border-red-500/30'
      case 'IN_PROGRESS':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
  }

  const getActionColor = (action: string) => {
    if (action.includes('LOGIN')) return 'text-purple-400'
    if (action.includes('REPORT')) return 'text-blue-400'
    if (action.includes('PROJECT')) return 'text-primary-400'
    return 'text-gray-400'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">System Audit Logs</h1>
            <p className="text-gray-400 mt-1">Track all platform activities, logins, and project uploads.</p>
          </div>
          <button 
            onClick={() => loadLogs(page)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-colors border border-dark-600"
          >
            <FaSpinner className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email, action, or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-800/80 backdrop-blur-sm border border-dark-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-inner shadow-black/20"
              />
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-gray-300 hover:text-white hover:border-dark-600 transition-all">
            <FaFilter />
            Filters
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 flex items-center gap-3">
            <FaShieldAlt className="text-xl" />
            <p>{error}</p>
          </div>
        )}

        {/* Logs Table */}
        <div className="bg-dark-800/80 backdrop-blur-md rounded-2xl border border-dark-700/50 overflow-hidden shadow-2xl shadow-black/40 relative">
          
          {loading && (
            <div className="absolute inset-0 z-10 bg-dark-900/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 flex items-center gap-3 shadow-xl">
                <FaSpinner className="animate-spin text-primary-500 text-xl" />
                <span className="text-gray-300 font-medium">Loading logs...</span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-900/50 text-xs font-semibold tracking-wide text-gray-400 uppercase border-b border-dark-700/50">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/50">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-dark-700/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {log.resource_type} {log.project_id ? `#${log.project_id}` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{log.user_name}</div>
                        <div className="text-xs text-gray-500 capitalize mt-1">{log.role.replace('_', ' ')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-400 bg-dark-900/50 px-2 py-1 rounded inline-block">
                          {log.ip_address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)} shadow-sm`}>
                          {log.status}
                        </span>
                        {log.error_message && (
                          <div className="text-xs text-red-400 mt-2 max-w-xs truncate" title={log.error_message}>
                            Error: {log.error_message}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  !loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No logs found matching your criteria.
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 bg-dark-900/50 border-t border-dark-700/50 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing page <span className="font-semibold text-white">{page}</span> of <span className="font-semibold text-white">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-dark-800 text-gray-400 hover:text-white hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-dark-700"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg bg-dark-800 text-gray-400 hover:text-white hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-dark-700"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
