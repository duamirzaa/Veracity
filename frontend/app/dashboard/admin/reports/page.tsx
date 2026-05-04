'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { FaFileAlt, FaSpinner } from 'react-icons/fa'
import { downloadAdminReport } from '@/services/reports'
import { addNotification } from '@/services/notifications'

type ReportFormat = 'json' | 'xml' | 'pdf'

export default function AdminReportsPage() {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('json')

  const allowedFormats: ReportFormat[] = ['json', 'xml', 'pdf']

  const handleGenerateReport = async () => {
    try {
      setGenerating(true)
      setError(null)

      const blob = await downloadAdminReport(selectedFormat)
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `admin_report_${new Date().toISOString().split('T')[0]}.${selectedFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      addNotification(`Platform-wide report downloaded successfully.`)
    } catch (err: any) {
      console.error('Failed to generate admin report:', err)
      const message = err?.response?.data?.error || err?.message || 'Failed to generate report'
      setError(message)
    } finally {
      setGenerating(false)
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
          <h1 className="text-2xl font-bold text-white">Admin Reports</h1>
          <p className="text-gray-400 mt-1">Generate and download platform-wide analytics and system reports.</p>
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

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">System Reports</h2>
          
          <div className="bg-dark-800 rounded-lg border border-dark-700 p-6 hover:border-dark-600 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Platform-Wide Report</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Comprehensive system report containing user statistics, project distribution, and overall risk metrics across the entire platform.
                </p>
                <div className="flex gap-4 mt-3 text-sm text-gray-500">
                  <span>Scope: All Projects & Users</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Format Selector */}
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value as ReportFormat)}
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
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  {generating ? (
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
        </div>
      </div>
    </DashboardLayout>
  )
}
