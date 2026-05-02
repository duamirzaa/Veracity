'use client'

import { useState, useEffect, useCallback } from 'react'
import { FaBell, FaQuestionCircle, FaCog, FaTrash, FaSpinner } from 'react-icons/fa'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import * as notificationService from '@/services/notifications'
import type { Notification } from '@/services/notifications'

export default function HeaderActions() {
  const { user } = useAuth()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const data = await notificationService.getNotifications()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchNotifications()
    
    // Listen for custom event for live updates
    const handleUpdate = () => fetchNotifications()
    window.addEventListener('notificationsUpdated', handleUpdate)
    
    return () => window.removeEventListener('notificationsUpdated', handleUpdate)
  }, [fetchNotifications])

  const handleClear = async () => {
    try {
      await notificationService.clearNotifications()
    } catch (error) {
      console.error('Failed to clear notifications:', error)
    }
  }

  const handleToggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen)
  }

  return (
    <div className="flex items-center gap-3">


      {/* Notifications Button */}
      <div className="relative">
        <button
          onClick={handleToggleNotifications}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors relative"
        >
          <FaBell className="text-xl text-gray-400 hover:text-primary-400" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
        {notificationsOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-dark-800 rounded-lg border border-dark-700 shadow-xl z-50">
            <div className="p-4 border-b border-dark-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-primary-500 text-dark-900 text-[10px] font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button 
                    onClick={handleClear}
                    className="text-xs text-gray-500 hover:text-primary-400 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <FaSpinner className="animate-spin text-primary-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Checking for updates...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <FaBell className="text-3xl text-dark-600 mx-auto mb-3 opacity-20" />
                  <p className="text-sm text-gray-500">No new notifications</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const time = new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  const date = new Date(notif.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
                  
                  return (
                    <div
                      key={notif.id}
                      className={`p-4 border-b border-dark-700 hover:bg-dark-700 transition-colors cursor-pointer ${
                        !notif.read ? 'bg-dark-700/30' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <p className="text-gray-200 text-sm leading-relaxed">{notif.message}</p>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2 font-medium uppercase tracking-wider">
                        {date} • {time}
                      </p>
                    </div>
                  )
                })
              )}
            </div>

          </div>
        )}
      </div>

      {/* Settings Link */}
      <Link
        href="/dashboard/settings"
        className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
      >
        <FaCog className="text-xl text-gray-400 hover:text-primary-400" />
      </Link>
    </div>
  )
}
