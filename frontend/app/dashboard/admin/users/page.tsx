'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { FaShieldAlt, FaEdit, FaTrash, FaPlus, FaSearch, FaSpinner } from 'react-icons/fa'
import { getUsers } from '@/services/admin'
import type { UserWithAccess } from '@/services/admin'

const mockUsers: UserWithAccess[] = [
  { id: 1, email: 'john@example.com', full_name: 'John Doe', role: 'user', tier: 'pro', is_active: true, is_email_verified: true, last_login_at: '2024-01-15T10:00:00Z', projects: ['E-commerce Platform'], access: 'read' },
  { id: 2, email: 'jane@example.com', full_name: 'Jane Smith', role: 'admin', tier: 'pro', is_active: true, is_email_verified: true, last_login_at: '2024-01-15T11:00:00Z', projects: ['API Gateway', 'Data Analytics'], access: 'write' },
  { id: 3, email: 'bob@example.com', full_name: 'Bob Johnson', role: 'user', tier: 'free', is_active: true, is_email_verified: true, last_login_at: '2024-01-14T09:00:00Z', projects: ['Payment Service'], access: 'read' },
  { id: 4, email: 'alice@example.com', full_name: 'Alice Brown', role: 'student', tier: 'free', is_active: true, is_email_verified: false, last_login_at: '2024-01-10T14:00:00Z', projects: ['All Projects'], access: 'admin' },
  { id: 5, email: 'charlie@example.com', full_name: 'Charlie Wilson', role: 'user', tier: 'pro', is_active: true, is_email_verified: true, last_login_at: '2024-01-15T15:00:00Z', projects: ['User Management'], access: 'read' },
]

export default function UserAccessPage() {
  const { user, isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [usersList, setUsersList] = useState<UserWithAccess[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await getUsers(1, 100)
        setUsersList(result.users)
      } catch (err) {
        console.error('Failed to load users:', err)
        setError('Failed to load users')
        // Keep mock data as fallback
        setUsersList(mockUsers)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && user?.role === 'admin') {
      loadUsers()
    }
  }, [isAuthenticated, user])

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

  // Only DBA can access
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

  const filteredUsers = usersList.filter(
    (u) =>
      (u.full_name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = (id: number) => {
    setUsersList(usersList.filter((u) => u.id !== id))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">User Access</h1>
            <p className="text-gray-400 mt-1">Manage who can see which project results</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
            <FaPlus />
            Add User
          </button>
        </div>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-blue-400 flex items-center gap-2">
            <FaSpinner className="animate-spin" />
            <p>Loading users...</p>
          </div>
        )}

        <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl border border-dark-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Projects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Access Level</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{user.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs font-semibold capitalize">
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(user.projects) ? (
                          user.projects.map((project, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-dark-700 rounded">
                              {project}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs">{user.projects}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.access === 'admin'
                            ? 'bg-purple-500/20 text-purple-400'
                            : user.access === 'write'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {user.access}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-primary-400 hover:text-primary-300 p-2">
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
