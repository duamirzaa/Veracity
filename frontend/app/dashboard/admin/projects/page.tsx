'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { FaShieldAlt, FaSearch, FaSpinner, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { getAdminProjects } from '@/services/admin'
import type { AdminProject } from '@/services/admin'

export default function ProjectRegistryPage() {
  const { user, isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [projectsList, setProjectsList] = useState<AdminProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 15

  const loadProjects = async (currentPage: number) => {
    try {
      setLoading(true)
      setError(null)
      const result = await getAdminProjects(currentPage, limit)
      setProjectsList(result.projects)
      setTotalPages(Math.ceil(result.total / limit))
    } catch (err) {
      console.error('Failed to load projects:', err)
      setError('Failed to load project registry.')
    } finally {
      setLoading(false)
    }
  }

  // Load projects on mount and when page changes
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadProjects(page)
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

  const filteredProjects = projectsList.filter(
    (p) =>
      p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Project Registry</h1>
            <p className="text-gray-400 mt-1">Global view of all projects uploaded by all users</p>
          </div>
          <button 
            onClick={() => loadProjects(page)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-colors border border-dark-600"
          >
            <FaSpinner className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by project name, owner name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-800/80 backdrop-blur-sm border border-dark-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-inner shadow-black/20"
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 flex items-center gap-3">
            <FaShieldAlt className="text-xl" />
            <p>{error}</p>
          </div>
        )}

        <div className="bg-dark-800/80 backdrop-blur-md rounded-2xl border border-dark-700/50 overflow-hidden shadow-2xl relative">
          
          {loading && (
            <div className="absolute inset-0 z-10 bg-dark-900/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 flex items-center gap-3 shadow-xl">
                <FaSpinner className="animate-spin text-primary-500 text-xl" />
                <span className="text-gray-300 font-medium">Loading projects...</span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-dark-900/50">
                <tr className="border-b border-dark-700/50 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Analyses</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/50">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project.project_id} className="hover:bg-dark-700/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white font-medium">{project.project_name}</div>
                        <div className="text-xs text-gray-500 mt-1">ID: #{project.project_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{project.full_name || 'No Name'}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{project.email}</span>
                          <span className="px-2 py-0.5 bg-dark-700 text-gray-300 rounded text-[10px] uppercase font-bold tracking-wider">
                            {project.user_role}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-primary-400 bg-primary-500/10 px-2 py-1 rounded inline-block border border-primary-500/20">
                          {project.analysis_count} scans
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            project.is_archived
                              ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              : 'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}
                        >
                          {project.is_archived ? 'Archived' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                        {new Date(project.created_at).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  !loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No projects found matching your criteria.
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
