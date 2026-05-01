'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { FaFileAlt, FaDownload, FaFilePdf, FaFileCode, FaFile, FaSpinner } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'
import type { Report } from '@/types/prediction'
import { downloadUserProjectReport, downloadAdminReport, downloadManagerReport, downloadStudentReport } from '@/services/reports'
import * as projectsService from '@/services/projects'
import type { Project } from '@/services/projects'

export default function ReportsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [reports, setReports] = useState<(Report & { projectId: number; projectName: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingReportId, setGeneratingReportId] = useState<number | null>(null)

  // Load projects from backend on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!user) {
          setProjects([])
          setReports([])
          return
        }

        const response = await projectsService.getProjects(1, 100)
        setProjects(response.projects)
        setReports([]) // Clear reports when loading new projects
      } catch (err) {
        console.error('Failed to load projects:', err)
        setError('Failed to load projects')
        setProjects([])
        setReports([])
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [user]) // Reload when user changes

  const handleGenerateReport = async (projectId: number) => {
    try {
      if (!user) {
        setError('User not authenticated')
        return
      }

      setGeneratingReportId(projectId)
      setError(null)

      // Generate report from backend
      const reportData = await projectsService.generateProjectReport(projectId)
      
      const project = projects.find(p => p.id === projectId)
      const newReport: Report & { projectId: number; projectName: string } = {
        title: reportData.report_type,
        report_type: reportData.report_type,
        report_format: 'json',
        generated_at: reportData.generated_at,
        projectId: projectId,
        projectName: project?.name || 'Unknown Project',
      }
      
      // Add to reports list (backend now holds the source data)
      setReports([newReport, ...reports])
    } catch (err) {
      console.error('Failed to generate report:', err)
      setError('Failed to generate report')
    } finally {
      setGeneratingReportId(null)
    }
  }

  const handleDownload = async (report: Report, idx: number) => {
    try {
      if (!user) return
      
      let blob: Blob
      
      if (user.role === 'admin') {
        blob = await downloadAdminReport(report.report_format)
      } else if (user.role === 'project_manager') {
        blob = await downloadManagerReport(report.report_format, user.tier)
      } else if (user.role === 'student') {
        blob = await downloadStudentReport(1, report.report_format)
      } else {
        blob = await downloadUserProjectReport(1, report.report_format, user.tier)
      }
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `report_${report.report_type}_${new Date(report.generated_at).toISOString().split('T')[0]}.${report.report_format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
      setError('Failed to download report')
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FaFilePdf className="text-red-400" />
      case 'xml':
        return <FaFileCode className="text-blue-400" />
      default:
        return <FaFile className="text-green-400" />
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-gray-400 mt-1">Generate reports from your projects</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
            {error}
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
              {projects.map((project) => (
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
              ))}
            </div>
          )}
        </div>

        {/* Generated Reports Section */}
        {reports.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Generated Reports</h2>
            <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Format
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700">
                    {reports.map((report, idx) => (
                      <tr key={idx} className="hover:bg-dark-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                          {report.projectName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-primary-500/20 text-primary-400 text-xs font-semibold rounded-full capitalize">
                            {report.report_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getFormatIcon(report.report_format)}
                            <span className="text-gray-400 uppercase">{report.report_format}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                          {formatDate(report.generated_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDownload(report, idx)}
                            className="text-primary-500 hover:text-primary-400 p-2 transition-colors"
                          >
                            <FaDownload />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
