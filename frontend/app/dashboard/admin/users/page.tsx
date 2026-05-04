'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { FaShieldAlt, FaTrash, FaSearch, FaSpinner, FaPowerOff } from 'react-icons/fa'
import { getUsers, updateUserRole, toggleUserStatus, deleteUser } from '@/services/admin'
import type { AdminUser } from '@/services/admin'

export default function UserAccessPage() {
  const { user, isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [usersList, setUsersList] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for updating role
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  // Load users on mount
  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getUsers(1, 100)
      setUsersList(result.users)
    } catch (err) {
      console.error('Failed to load users:', err)
      setError('Failed to load users from the server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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

  const filteredUsers = (usersList || []).filter(
    (u) =>
      (u.full_name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (u.email?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
  )

  const handleRoleChange = async (id: number, newRole: string) => {
    try {
      setUpdatingId(id)
      await updateUserRole(id, newRole)
      setUsersList(usersList.map(u => u.user_id === id ? { ...u, role: newRole as any } : u))
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update role')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleToggleStatus = async (id: number) => {
    try {
      setUpdatingId(id)
      await toggleUserStatus(id)
      setUsersList(usersList.map(u => u.user_id === id ? { ...u, is_active: !u.is_active } : u))
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to toggle status')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;

    try {
      setUpdatingId(id)
      await deleteUser(id)
      setUsersList(usersList.filter((u) => u.user_id !== id))
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete user')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-gray-400 mt-1">Manage user roles, tiers, and access permissions</p>
          </div>
          <button
            onClick={loadUsers}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-600 hover:bg-dark-700 text-white rounded-lg transition-colors"
          >
            <FaSpinner className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800/80 backdrop-blur-sm border border-dark-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-inner"
            />
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
                <span className="text-gray-300 font-medium">Loading users...</span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-dark-900/50">
                <tr className="border-b border-dark-700/50">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tier</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Last Login</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/50">
                {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                  <tr key={u.user_id} className={`hover:bg-dark-700/30 transition-colors ${updatingId === u.user_id ? 'opacity-50 pointer-events-none' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-medium">{u.full_name || 'No Name'}</div>
                      <div className="text-gray-400 text-sm mt-0.5">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                        className="bg-dark-900 border border-dark-600 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2"
                      >
                        <option value="user">User</option>
                        {(u.email.endsWith('.edu') || u.role === 'student') && <option value="student">Student</option>}
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${u.tier === 'pro' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                        {u.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(u.user_id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${u.is_active
                            ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                          }`}
                        title="Click to toggle status"
                      >
                        <FaPowerOff className={u.is_active ? 'text-green-400' : 'text-red-400'} />
                        {u.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(u.user_id)}
                        disabled={u.email === user.email}
                        className={`p-2 rounded-lg transition-colors ${u.email === user.email
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-red-400 hover:bg-red-500/20 hover:text-red-300'
                          }`}
                        title={u.email === user.email ? "You cannot delete yourself" : "Delete user"}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                )) : (
                  !loading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
