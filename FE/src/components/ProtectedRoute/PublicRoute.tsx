import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { UserRole } from '../../types'
import Loading from '../Loading/Loading'

interface PublicRouteProps {
  children: ReactNode
  redirectIfAuthenticated?: string // Redirect nếu đã đăng nhập (dùng cho login/register)
  blockAdminAndOwner?: boolean // Chặn Admin và Owner truy cập (dùng cho trang default)
}

/**
 * PublicRoute - Cho phép tất cả user truy cập, kể cả chưa đăng nhập
 * Nếu redirectIfAuthenticated được set, sẽ redirect user đã đăng nhập về trang đó
 * Nếu blockAdminAndOwner = true, sẽ chặn Admin và Owner truy cập
 */
const PublicRoute = ({ 
  children, 
  redirectIfAuthenticated,
  blockAdminAndOwner = false 
}: PublicRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  // Hiển thị loading khi đang kiểm tra
  if (loading) {
    return <Loading />
  }

  // Nếu đã đăng nhập
  if (isAuthenticated && user) {
    // Chặn Admin và Owner vào trang default
    if (blockAdminAndOwner) {
      if (user.role === UserRole.ADMIN) {
        return <Navigate to="/admin/dashboard" replace />
      } else if (user.role === UserRole.HOSTELOWNER || user.role === UserRole.HOSTEL_OWNER) {
        return <Navigate to="/owner/dashboard" replace />
      }
    }

    // Nếu có redirectIfAuthenticated, redirect về trang đó
    if (redirectIfAuthenticated) {
      // Redirect về trang phù hợp với role
      let redirectPath = redirectIfAuthenticated
      
      if (redirectIfAuthenticated === 'dashboard') {
        if (user.role === UserRole.ADMIN) {
          redirectPath = '/admin/dashboard'
        } else if (user.role === UserRole.HOSTELOWNER || user.role === UserRole.HOSTEL_OWNER) {
          redirectPath = '/owner/dashboard'
        } else {
          redirectPath = '/'
        }
      }
      
      return <Navigate to={redirectPath} replace />
    }
  }

  return <>{children}</>
}

export default PublicRoute

