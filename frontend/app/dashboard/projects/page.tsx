'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { FaPlus, FaGithub, FaFolder, FaTrash, FaEdit, FaCode, FaSpinner, FaChartLine } from 'react-icons/fa'
import * as projectsService from '@/services/projects'
import type { Project } from '@/services/projects'
import { addNotification } from '@/services/notifications'
import { getErrorMessage } from '@/utils/error-handler'


export default function ProjectsPage() {
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    project_name: '',
    project_description: '',
  })
  const [fileInput, setFileInput] = useState<File | null>(null)
  
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
  })

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await projectsService.getProjects(1, 100)
        setProjects(response.projects)
      } catch (err) {
        console.error('Failed to fetch projects:', err)
        setError('Failed to load projects')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileInput(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fileInput) {
      setError('Please select a Python file')
      return
    }

    // Check project limit for free users
    if (user?.tier !== 'pro' && projects.length >= 5) {
      window.dispatchEvent(new CustomEvent('upgrade-required'))
      setShowModal(false)
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const newProject = await projectsService.createProject({
        project_name: formData.project_name,
        project_description: formData.project_description || undefined,
        file: fileInput,
      })
      
      setProjects([...projects, newProject])
      setFormData({ project_name: '', project_description: '' })
      setFileInput(null)
      setShowModal(false)
      addNotification(`Project created: ${newProject.name}. Initial analysis triggered.`)
      window.dispatchEvent(new CustomEvent('project-created'))
    } catch (err) {
      console.error('Failed to create project:', err)
      setError(getErrorMessage(err, 'Failed to create project'))
    }
    finally {
    setSubmitting(false)  // ← stop loading always
  }
  }

  const handleDelete = async (id: number) => {
    try {
      setError(null)
      await projectsService.archiveProject(id)
      setProjects(projects.filter((p) => p.id !== id))
      window.dispatchEvent(new CustomEvent('project-deleted'))
    } catch (err) {
      console.error('Failed to delete project:', err)
      setError('Failed to delete project')
    }
  }

  const handleAnalyze = (projectId: number) => {
    router.push(`/dashboard/analysis?projectId=${projectId}`)
  }

  const handleEditClick = (project: Project) => {
    setEditingProject(project)
    setEditFormData({
      name: project.name,
      description: project.description || '',
    })
    setShowEditModal(true)
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProject) return

    try {
      setSubmitting(true)
      setError(null)
      const updated = await projectsService.updateProject(editingProject.id, {
        project_name: editFormData.name,
        project_description: editFormData.description,
      })
      
      setProjects(projects.map(p => p.id === updated.id ? updated : p))
      setShowEditModal(false)
      addNotification(`Project updated: ${updated.name}`)
    } catch (err) {
      console.error('Failed to update project:', err)
      setError('Failed to update project')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-gray-400 mt-1">Manage your code analysis projects</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaPlus /> New Project
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-red-400">
            <p>{error}</p>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeleton
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-dark-800 rounded-lg p-6 border border-dark-700 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-lg bg-dark-600"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-dark-600 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-dark-600 rounded w-32"></div>
                    </div>
                  </div>
                </div>
                <div className="h-3 bg-dark-600 rounded w-full mb-4"></div>
                <div className="h-3 bg-dark-600 rounded w-24"></div>
              </div>
            ))
          ) : projects.length === 0 ? (
            // No projects
            <div className="col-span-full text-center py-12">
              <FaFolder className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No projects yet</p>
              <p className="text-gray-500 text-sm">Create your first project to get started</p>
            </div>
          ) : (
            // Loaded projects
            projects.map((project) => (
            <div
              key={project.id}
              className="bg-dark-800 rounded-lg p-6 border border-dark-700 hover:border-primary-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 border border-primary-500/30 flex items-center justify-center flex-shrink-0">
                    <FaFolder className="text-xl text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEditClick(project)}
                    className="text-gray-400 hover:text-white p-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-gray-400 hover:text-red-400 p-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4">{project.description}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <FaCode />
                  <span>{project.analysis_count} files</span>
                </div>
                <span className="text-gray-500">Updated {new Date(project.updated_at).toLocaleDateString()}</span>
              </div>

              <button
                onClick={() => handleAnalyze(project.id)}
                className="w-full mt-4 bg-dark-700 hover:bg-dark-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {project.latest_prediction_id ? (
                  <>
                    <FaChartLine className="text-xs text-primary-400" />
                    View Analysis
                  </>
                ) : (
                  'Analyze Code'
                )}
              </button>
            </div>
            ))
          )}
        </div>

        {/* Add Project Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-dark-800 rounded-lg p-6 w-full max-w-md border border-dark-700">
              <h2 className="text-xl font-semibold text-white mb-4">Create New Project</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                  <input
                    type="text"
                    name="project_name"
                    value={formData.project_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="My Project"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    name="project_description"
                    value={formData.project_description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="Project description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Python File (.py)
                  </label>
                  <input
                    type="file"
                    name="file"
                    accept=".py"
                    onChange={handleFileChange}
                    required
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {fileInput && <p className="text-sm text-green-400 mt-1">Selected: {fileInput.name}</p>}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Edit Project Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-dark-800 rounded-lg p-6 w-full max-w-md border border-dark-700">
              <h2 className="text-xl font-semibold text-white mb-4">Edit Project</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
