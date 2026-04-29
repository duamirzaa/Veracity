import apiClient from './api'
import type { Report } from '@/types/prediction'

type ReportFormat = 'json' | 'xml' | 'pdf'

/**
 * Get allowed report formats based on user role and tier
 * @param userRole - The user's role
 * @param userTier - The user's subscription tier ('free' or 'pro')
 * @returns Array of allowed formats
 */
export const getAllowedReportFormats = (userRole: string, userTier: string): ReportFormat[] => {
  // Students can always generate all formats regardless of tier
  if (userRole === 'student') {
    return ['json', 'xml', 'pdf']
  }

  // Project managers and admins can always generate all formats
  if (userRole === 'project_manager' || userRole === 'admin') {
    return ['json', 'xml', 'pdf']
  }

  // Regular users: tier determines available formats
  if (userRole === 'user') {
    if (userTier === 'pro') {
      return ['json', 'xml', 'pdf']
    }
    return ['json', 'xml']
  }

  // Default: restrict to JSON and XML
  return ['json', 'xml']
}

/**
 * Validate if a format is allowed for the user
 * @param format - The requested format
 * @param userRole - The user's role
 * @param userTier - The user's subscription tier ('free' or 'pro')
 * @returns true if format is allowed, false otherwise
 */
export const isFormatAllowed = (format: ReportFormat, userRole: string, userTier: string): boolean => {
  const allowedFormats = getAllowedReportFormats(userRole, userTier)
  return allowedFormats.includes(format)
}

/**
 * Download admin report
 * GET /api/report/admin/{format}
 */
export const downloadAdminReport = async (format: ReportFormat): Promise<Blob> => {
  try {
    if (!['json', 'xml', 'pdf'].includes(format)) {
      throw new Error(`Invalid format: ${format}`)
    }
    const response = await apiClient.get(`/report/admin/${format}`, {
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Download manager report
 * GET /api/report/manager/{format}
 * Note: PDF requires pro tier
 */
export const downloadManagerReport = async (format: ReportFormat, userTier: string): Promise<Blob> => {
  try {
    if (format === 'pdf' && userTier !== 'pro') {
      throw new Error('PDF format requires pro tier subscription')
    }
    if (!['json', 'xml', 'pdf'].includes(format)) {
      throw new Error(`Invalid format: ${format}`)
    }
    const response = await apiClient.get(`/report/manager/${format}`, {
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Download user's personal report for a project
 * GET /api/report/my/:projectId/{format}
 * Note: PDF requires pro tier
 */
export const downloadUserProjectReport = async (
  projectId: number,
  format: ReportFormat,
  userTier: string,
): Promise<Blob> => {
  try {
    if (format === 'pdf' && userTier !== 'pro') {
      throw new Error('PDF format requires pro tier subscription')
    }
    if (!['json', 'xml', 'pdf'].includes(format)) {
      throw new Error(`Invalid format: ${format}`)
    }
    const response = await apiClient.get(`/report/my/${projectId}/${format}`, {
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Download student report
 * GET /api/report/student/:id/{format}
 * Note: Students can access all formats
 */
export const downloadStudentReport = async (studentId: number, format: ReportFormat): Promise<Blob> => {
  try {
    if (!['json', 'xml', 'pdf'].includes(format)) {
      throw new Error(`Invalid format: ${format}`)
    }
    const response = await apiClient.get(`/report/student/${studentId}/${format}`, {
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Helper function to download report based on user role
 * Automatically constructs the correct endpoint and validates permissions
 * @param format - Report format (json, xml, or pdf)
 * @param userRole - User's role (admin, project_manager, user, or student)
 * @param userTier - User's tier (free or pro)
 * @param projectId - Project ID (required for 'user' role)
 * @param userId - User ID (required for 'student' role)
 * @returns Blob of the report file
 */
export const downloadReport = async (
  format: ReportFormat,
  userRole: string,
  userTier: string,
  projectId?: number,
  userId?: number,
): Promise<Blob> => {
  // Validate format is allowed for this user
  if (!isFormatAllowed(format, userRole, userTier)) {
    const allowedFormats = getAllowedReportFormats(userRole, userTier)
    throw new Error(
      `Format '${format}' not allowed for your user role/tier. Allowed formats: ${allowedFormats.join(', ')}`,
    )
  }

  // Route to appropriate endpoint based on role
  switch (userRole) {
    case 'admin':
      return downloadAdminReport(format)

    case 'project_manager':
      return downloadManagerReport(format, userTier)

    case 'user':
      if (!projectId) {
        throw new Error('projectId is required for user reports')
      }
      return downloadUserProjectReport(projectId, format, userTier)

    case 'student':
      if (!userId) {
        throw new Error('userId is required for student reports')
      }
      return downloadStudentReport(userId, format)

    default:
      throw new Error(`Unknown user role: ${userRole}`)
  }
}
