import { useState, useEffect, useRef } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import './Notification.css'

const Notification = () => {
  const { notifications, removeNotification } = useNotification()
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set())
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Tự động set exit animation trước khi remove
  useEffect(() => {
    notifications.forEach((notification) => {
      // Nếu notification mới được thêm và chưa có timeout
      if (!timeoutRefs.current.has(notification.id) && !exitingIds.has(notification.id)) {
        const timeoutId = setTimeout(() => {
          handleRemove(notification.id)
        }, 5000) // 5 giây
        timeoutRefs.current.set(notification.id, timeoutId)
      }
    })

    // Cleanup timeouts cho notifications đã bị xóa
    const currentIds = new Set(notifications.map(n => n.id))
    timeoutRefs.current.forEach((timeoutId, id) => {
      if (!currentIds.has(id)) {
        clearTimeout(timeoutId)
        timeoutRefs.current.delete(id)
      }
    })
  }, [notifications, exitingIds])

  const handleRemove = (id: string) => {
    // Clear timeout nếu có
    const timeoutId = timeoutRefs.current.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutRefs.current.delete(id)
    }

    // Set exit state để trigger animation
    setExitingIds(prev => new Set(prev).add(id))
    
    // Đợi animation hoàn thành trước khi xóa khỏi state
    setTimeout(() => {
      removeNotification(id)
      setExitingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }, 300) // Thời gian animation
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type} ${
            exitingIds.has(notification.id) ? 'notification-exit' : ''
          }`}
          onClick={() => handleRemove(notification.id)}
        >
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' && '✓'}
              {notification.type === 'info' && 'ℹ'}
              {notification.type === 'error' && '✕'}
              {notification.type === 'warning' && '⚠'}
            </span>
            <span className="notification-message">{notification.message}</span>
          </div>
          <button
            className="notification-close"
            onClick={(e) => {
              e.stopPropagation()
              handleRemove(notification.id)
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default Notification

