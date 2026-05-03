'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { FaFileAlt, FaSpinner } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'
import { downloadUserProjectReport, downloadAdminReport, downloadManagerReport, downloadStudentReport, getAllowedReportFormats } from '@/services/reports'
import * as projectsService from '@/services/projects'
import type { Project } from '@/services/projects'
import { addNotification } from '@/services/notifications'

type ReportFormat = 'json' | 'xml' | 'pdf'

export default function ReportsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingReportId, setGeneratingReportId] = useState<number | null>(null)
  const [selectedFormats, setSelectedFormats] = useState<Record<number, ReportFormat>>({})

  // Clear legacy localStorage reports on mount
  useEffect(() => {
    localStorage.removeItem('veracity_saved_reports')
  }, [])

  // Get allowed formats for the current user
  const allowedFormats: ReportFormat[] = user
    ? getAllowedReportFormats(user.role, user.tier)
    : ['json', 'xml']

  // Load projects from backend on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!user) {
          setProjects([])
          return
        }

        const response = await projectsService.getProjects(1, 100)
        setProjects(response.projects)
      } catch (err) {
        console.error('Failed to load projects:', err)
        setError('Failed to load projects')
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [user])

  const handleFormatChange = (projectId: number, format: ReportFormat) => {
    setSelectedFormats(prev => ({ ...prev, [projectId]: format }))
  }

  const handleGenerateReport = async (projectId: number) => {
    try {
      if (!user) {
        setError('User not authenticated')
        return
      }

      setGeneratingReportId(projectId)
      setError(null)

      const format = selectedFormats[projectId] || allowedFormats[0] || 'json'
      const project = projects.find(p => p.id === projectId)

      let blob: Blob
      
      if (user.role === 'admin') {
        blob = await downloadAdminReport(format)
      } else if (user.role === 'project_manager') {
        blob = await downloadManagerReport(format, user.tier)
      } else if (user.role === 'student') {
        blob = await downloadStudentReport(projectId, format)
      } else {
        blob = await downloadUserProjectReport(projectId, format, user.tier)
      }
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `report_${project?.name || 'project'}_${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      addNotification(`Report downloaded: report_${project?.name || 'project'}.${format}`)
    } catch (err: any) {
      console.error('Failed to generate report:', err)
      const message = err?.response?.data?.error || err?.message || 'Failed to generate report'
      setError(message)
    } finally {
      setGeneratingReportId(null)
    }
  }

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'json': return 'JSON'
      case 'xml': return 'XML'
      case 'pdf': return 'PDF'
      default: return format.toUpperCase()
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-gray-400 mt-1">Generate and download reports from your projects</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 ml-4 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Projects Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Your Projects</h2>
          
          {loading ? (
            <div className="bg-dark-800 rounded-lg border border-dark-700 p-8 flex items-center justify-center gap-3">
              <FaSpinner className="animate-spin text-primary-500" />
              <span className="text-gray-400">Loading projects...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-dark-800 rounded-lg border border-dark-700 border-dashed p-12 text-center">
              <FaFileAlt className="text-4xl text-dark-600 mx-auto mb-3" />
              <p className="text-gray-400 text-lg">No projects found</p>
              <p className="text-gray-500 text-sm mt-1">Create a project first to generate reports</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => {
                const currentFormat = selectedFormats[project.id] || allowedFormats[0] || 'json'
                return (
                  <div key={project.id} className="bg-dark-800 rounded-lg border border-dark-700 p-6 hover:border-dark-600 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                        {project.description && (
                          <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                        )}
                        <div className="flex gap-4 mt-3 text-sm text-gray-500">
                          <span>Analyses: {project.analysis_count}</span>
                          <span>•</span>
                          <span>{(project.file_size_bytes / 1024).toFixed(2)} KB</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Format Selector */}
                        <select
                          value={currentFormat}
                          onChange={(e) => handleFormatChange(project.id, e.target.value as ReportFormat)}
                          className="bg-dark-700 border border-dark-600 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 transition-colors"
                        >
                          {allowedFormats.map((fmt) => (
                            <option key={fmt} value={fmt}>
                              {getFormatLabel(fmt)}
                            </option>
                          ))}
                        </select>

                        {/* Generate Button */}
                        <button
                          onClick={() => handleGenerateReport(project.id)}
                          disabled={generatingReportId === project.id}
                          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                        >
                          {generatingReportId === project.id ? (
                            <>
                              <FaSpinner className="animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <FaFileAlt />
                              Generate Report
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
