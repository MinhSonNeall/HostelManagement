import { createContext, useContext, useState, ReactNode } from 'react'

export type NotificationType = 'success' | 'info' | 'error' | 'warning'

export interface Notification {
  id: string
  message: string
  type: NotificationType
}

interface NotificationContextType {
  notifications: Notification[]
  showNotification: (message: string, type: NotificationType) => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = (message: string, type: NotificationType) => {
    // Không tạo notification nếu message rỗng
    if (!message || message.trim() === '') {
      return
    }
    
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const notification: Notification = { id, message, type }
    
    setNotifications(prev => [...prev, notification])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

