import apiClient from './api'

// Backend response structure
export interface ProjectBackendResponse {
  project_id: number
  user_id: number
  project_name: string
  project_description: string | null
  file_size_bytes: number
  file_encoding: string | null
  is_archived: boolean
  latest_prediction_id: number | null
  analysis_count: number
  created_at: string
  updated_at: string
  archived_at: string | null
}

// Frontend display structure (transformed from backend)
export interface Project {
  id: number
  user_id: number
  name: string
  description: string | null
  file_size_bytes: number
  file_encoding: string | null
  is_archived: boolean
  latest_prediction_id: number | null
  analysis_count: number
  created_at: string
  updated_at: string
  archived_at: string | null
}

interface ProjectsListResponse {
  projects: Project[]
  total: number
  page: number
  limit: number
}

interface CreateProjectRequest {
  project_name: string
  project_description?: string
  file: File
}

interface UpdateProjectRequest {
  project_name?: string
  project_description?: string
}

/**
 * Transform backend project response to frontend format
 */
function transformProjectFromBackend(backendProject: ProjectBackendResponse): Project {
  return {
    id: backendProject.project_id,
    user_id: backendProject.user_id,
    name: backendProject.project_name,
    description: backendProject.project_description,
    file_size_bytes: backendProject.file_size_bytes,
    file_encoding: backendProject.file_encoding,
    is_archived: backendProject.is_archived,
    latest_prediction_id: backendProject.latest_prediction_id,
    analysis_count: backendProject.analysis_count,
    created_at: backendProject.created_at,
    updated_at: backendProject.updated_at,
    archived_at: backendProject.archived_at,
  }
}

export const getProjects = async (page: number = 1, limit: number = 10): Promise<ProjectsListResponse> => {
  try {
    const response = await apiClient.get<{ projects: ProjectBackendResponse[]; total: number; page: number; limit: number }>('/projects', {
      params: { page, limit },
    })
    console.log("FULL RESPONSE:", response.data)
    return {
      projects: Array.isArray(response.data)
    ? response.data.map(transformProjectFromBackend)        // new account → []
    : (response.data.projects ?? []).map(transformProjectFromBackend), // has projects → {}
  total: Array.isArray(response.data) ? response.data.length : response.data.total ?? 0,
  page: Array.isArray(response.data) ? 1 : response.data.page ?? 1,
  limit: Array.isArray(response.data) ? 10 : response.data.limit ?? 10,
    }
  } catch (error) {
    throw error
  }
}

/**
 * Get single project by ID
 */
export const getProjectById = async (id: number): Promise<Project> => {
  try {
    const response = await apiClient.get<ProjectBackendResponse>(`/projects/${id}`)
    return transformProjectFromBackend(response.data)
  } catch (error) {
    throw error
  }
}

/**
 * Create new project by uploading a .py file
 */
export const createProject = async (payload: CreateProjectRequest): Promise<Project> => {
  try {
    const formData = new FormData()
    formData.append('project_name', payload.project_name)
    formData.append('project_description', payload.project_description || '')
    formData.append('file', payload.file)

    const response = await apiClient.post<{ project: ProjectBackendResponse }>('/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return transformProjectFromBackend(response.data.project)
  } catch (error) {
    throw error
  }
}

/**
 * Update project
 */
export const updateProject = async (id: number, payload: UpdateProjectRequest): Promise<Project> => {
  try {
    const response = await apiClient.put<{ project: ProjectBackendResponse }>(`/projects/${id}`, payload)
    return transformProjectFromBackend(response.data.project)
  } catch (error) {
    throw error
  }
}

/**
 * Get all projects with reports
 * GET /api/projects/report/all
 */
export const getProjectsReportAll = async (): Promise<Project[]> => {
  try {
    const response = await apiClient.get<ProjectBackendResponse[]>('/projects/report/all')
    return response.data.map(transformProjectFromBackend)
  } catch (error) {
    throw error
  }
}

/**
 * Get project results/predictions
 * GET /api/projects/:id/results
 */
export const getProjectResults = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/projects/${id}/results`)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Get project report
 * GET /api/projects/:id/report
 */
export const getProjectReport = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.get(`/projects/${id}/report`)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Archive project (soft delete - keeps data in database)
 * PATCH /api/projects/:id/archive
 */
export const archiveProject = async (id: number): Promise<Project> => {
  try {
    const response = await apiClient.patch<{ project: ProjectBackendResponse }>(`/projects/${id}/archive`)
    return transformProjectFromBackend(response.data.project)
  } catch (error) {
    throw error
  }
}

/**
 * Unarchive project (restore archived project)
 * PATCH /api/projects/:id/unarchive
 */
export const unarchiveProject = async (id: number): Promise<Project> => {
  try {
    const response = await apiClient.patch<{ project: ProjectBackendResponse }>(`/projects/${id}/unarchive`)
    return transformProjectFromBackend(response.data.project)
  } catch (error) {
    throw error
  }
}

/**
 * Archive project (deprecated - use archiveProject instead)
 */
export const archiveProjectOld = async (id: number): Promise<Project> => {
  try {
    const response = await apiClient.delete<ProjectBackendResponse>(`/projects/${id}`)
    return transformProjectFromBackend(response.data)
  } catch (error) {
    throw error
  }
}

/**
 * Generate a role-based report for a project from backend
 */
export const generateProjectReport = async (projectId: number) => {
  try {
    const response = await apiClient.get(`/projects/${projectId}/report`)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Delete project (deprecated - use archiveProject instead)
 */
export const deleteProject = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/projects/${id}`)
  } catch (error) {
    throw error
  }
}

export interface MitigationStrategy {
  feature_name: string
  mitigation_advice: string | null
  has_advice: boolean
}

export interface MitigationResponse {
  has_advice: boolean
  strategies: MitigationStrategy[]
}

/**
 * Get project mitigation advice
 * GET /api/projects/:id/mitigation
 */
export const getProjectMitigation = async (projectId: number): Promise<MitigationResponse> => {
  try {
    const response = await apiClient.get<MitigationResponse>(`/projects/${projectId}/mitigation`)
    return response.data
  } catch (error) {
    throw error
  }
}
