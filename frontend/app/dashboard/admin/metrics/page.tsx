'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { FaShieldAlt, FaSpinner, FaEdit, FaCheck, FaTimes } from 'react-icons/fa'
import { getRules, updateRule, MitigationRule } from '@/services/admin'
import { addNotification } from '@/services/notifications'

export default function MetricConfiguratorPage() {
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rules, setRules] = useState<MitigationRule[]>([])
  
  // Edit State
  const [editingRule, setEditingRule] = useState<MitigationRule | null>(null)
  const [editForm, setEditForm] = useState<Partial<MitigationRule>>({})
  const [isSaving, setIsSaving] = useState(false)

  const loadRules = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getRules()
      setRules(result.rules || [])
    } catch (err: any) {
      console.error('Failed to load rules:', err)
      setError(err?.response?.data?.error || err?.message || 'Failed to load rules')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadRules()
    }
  }, [isAuthenticated, user])

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

  const handleEditClick = (rule: MitigationRule) => {
    setEditingRule(rule)
    setEditForm({
      threshold_low: rule.threshold_low,
      threshold_high: rule.threshold_high,
      priority: rule.priority,
      mitigation_advice: rule.mitigation_advice,
      is_active: rule.is_active,
    })
  }

  const handleCancelEdit = () => {
    setEditingRule(null)
    setEditForm({})
  }

  const handleSaveEdit = async () => {
    if (!editingRule) return
    
    // Validate
    const low = Number(editForm.threshold_low)
    const high = Number(editForm.threshold_high)
    if (!isNaN(low) && !isNaN(high) && low >= high) {
      addNotification('Error: Threshold Low must be less than Threshold High')
      return
    }

    try {
      setIsSaving(true)
      const updated = await updateRule(editingRule.id, editForm)
      
      setRules(prev => prev.map(r => r.id === updated.id ? updated : r))
      addNotification(`Rule for ${updated.metric_name} updated successfully`)
      handleCancelEdit()
    } catch (err: any) {
      console.error('Failed to update rule:', err)
      addNotification(err?.response?.data?.error || err?.message || 'Failed to update rule')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async (rule: MitigationRule) => {
    try {
      const updated = await updateRule(rule.id, { is_active: !rule.is_active })
      setRules(prev => prev.map(r => r.id === updated.id ? updated : r))
      addNotification(`Rule ${updated.metric_name} is now ${updated.is_active ? 'active' : 'inactive'}`)
    } catch (err: any) {
      console.error('Failed to toggle rule:', err)
      addNotification(err?.response?.data?.error || err?.message || 'Failed to toggle rule')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mitigation Rules Configuration</h1>
          <p className="text-gray-400 mt-1">Manage thresholds and advice for chatbot risk mitigation</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-blue-400 flex items-center gap-2">
            <FaSpinner className="animate-spin" />
            <p>Loading rules...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {rules.map(rule => (
              <div key={rule.id} className="bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-dark-700/50 flex flex-col h-full shadow-lg transition-all hover:border-dark-600">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {rule.metric_name}
                      <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(rule.priority)}`}>
                        {rule.priority}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Version {rule.version}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleToggleActive(rule)}
                      className={`text-xs px-3 py-1 rounded-lg border font-semibold transition-colors ${
                        rule.is_active 
                          ? 'bg-primary-500/20 text-primary-400 border-primary-500/30 hover:bg-primary-500/30' 
                          : 'bg-dark-600/50 text-gray-400 border-dark-500 hover:bg-dark-600'
                      }`}
                    >
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => handleEditClick(rule)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                      title="Edit Rule"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-dark-900/50 rounded-lg border border-dark-700/50">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Low Threshold</p>
                    <p className="text-lg font-semibold text-white">{rule.threshold_low}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">High Threshold</p>
                    <p className="text-lg font-semibold text-white">{rule.threshold_high}</p>
                  </div>
                </div>

                <div className="mt-auto">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Mitigation Advice</p>
                  <p className="text-sm text-gray-300 bg-dark-700/30 p-3 rounded-lg border border-dark-600/30 leading-relaxed italic">
                    "{rule.mitigation_advice}"
                  </p>
                </div>
              </div>
            ))}
            
            {rules.length === 0 && !loading && (
               <div className="col-span-full bg-dark-800 rounded-lg border border-dark-700 border-dashed p-12 text-center">
                 <p className="text-gray-400">No mitigation rules found.</p>
               </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {editingRule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 w-full max-w-2xl shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6">
                Edit Rule: {editingRule.metric_name}
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Threshold Low</label>
                    <input 
                      type="number"
                      step="any"
                      value={editForm.threshold_low ?? ''}
                      onChange={e => setEditForm({ ...editForm, threshold_low: parseFloat(e.target.value) })}
                      className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Threshold High</label>
                    <input 
                      type="number"
                      step="any"
                      value={editForm.threshold_high ?? ''}
                      onChange={e => setEditForm({ ...editForm, threshold_high: parseFloat(e.target.value) })}
                      className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={e => setEditForm({ ...editForm, priority: e.target.value as any })}
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Mitigation Advice</label>
                  <textarea
                    rows={4}
                    value={editForm.mitigation_advice ?? ''}
                    onChange={e => setEditForm({ ...editForm, mitigation_advice: e.target.value })}
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-dark-700">
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-dark-900 font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
