const STORAGE_KEY = 'veracity_notifications'

export interface Notification {
  id: number
  message: string
  timestamp: string
  read: boolean
}

interface NotificationsResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
}

/**
 * Get notifications from localStorage
 */
export const getNotifications = async (): Promise<NotificationsResponse> => {
  if (typeof window === 'undefined') return { notifications: [], total: 0, unreadCount: 0 }
  
  const stored = localStorage.getItem(STORAGE_KEY)
  const notifications: Notification[] = stored ? JSON.parse(stored) : []
  
  // Sort by timestamp descending
  notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  return {
    notifications,
    total: notifications.length,
    unreadCount
  }
}

/**
 * Add a new notification
 */
export const addNotification = (message: string) => {
  if (typeof window === 'undefined') return
  
  const stored = localStorage.getItem(STORAGE_KEY)
  const notifications: Notification[] = stored ? JSON.parse(stored) : []
  
  const newNotification: Notification = {
    id: Date.now(),
    message,
    timestamp: new Date().toISOString(),
    read: false
  }
  
  notifications.push(newNotification)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  
  // Dispatch a custom event to notify HeaderActions
  window.dispatchEvent(new Event('notificationsUpdated'))
}

/**
 * Clear all notifications
 */
export const clearNotifications = async (): Promise<void> => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
  window.dispatchEvent(new Event('notificationsUpdated'))
}

/**
 * Mark a notification as read
 */
export const markAsRead = async (id: number): Promise<void> => {
  if (typeof window === 'undefined') return
  
  const stored = localStorage.getItem(STORAGE_KEY)
  const notifications: Notification[] = stored ? JSON.parse(stored) : []
  
  const updated = notifications.map(n => 
    n.id === id ? { ...n, read: true } : n
  )
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event('notificationsUpdated'))
}
