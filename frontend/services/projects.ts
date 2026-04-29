import apiClient from './api'

export interface Project {
  id: number
  name: string
  description: string
  repository_url?: string
  repository_type?: string
  files_analyzed: number
  last_analyzed: string
  created_at?: string
  updated_at?: string
  is_archived: boolean
  archived_at?: string | null
}

interface ProjectsListResponse {
  projects: Project[]
  total: number
  page: number
  limit: number
}

interface CreateProjectRequest {
  name: string
  description: string
  repository_url?: string
  repository_type?: string
}

interface UpdateProjectRequest {
  name?: string
  description?: string
  repository_url?: string
  repository_type?: string
}

/**
 * Get all projects
 */
export const getProjects = async (page: number = 1, limit: number = 10): Promise<ProjectsListResponse> => {
  try {
    const response = await apiClient.get<ProjectsListResponse>('/projects', {
      params: { page, limit },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Get single project by ID
 */
export const getProjectById = async (id: number): Promise<Project> => {
  try {
    const response = await apiClient.get<Project>(`/projects/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Create new project
 */
export const createProject = async (payload: CreateProjectRequest): Promise<Project> => {
  try {
    const response = await apiClient.post<Project>('/projects', payload)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Update project
 */
export const updateProject = async (id: number, payload: UpdateProjectRequest): Promise<Project> => {
  try {
    const response = await apiClient.put<Project>(`/projects/${id}`, payload)
    return response.data
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
    const response = await apiClient.get<Project[]>('/projects/report/all')
    return response.data
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
    const response = await apiClient.patch<Project>(`/projects/${id}/archive`)
    return response.data
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
    const response = await apiClient.patch<Project>(`/projects/${id}/unarchive`)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Archive project (deprecated - use archiveProject instead)
 */
export const archiveProjectOld = async (id: number): Promise<Project> => {
  try {
    const response = await apiClient.delete(`/projects/${id}`)
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
