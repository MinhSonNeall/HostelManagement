import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { UserRole } from '../../types'
import Loading from '../Loading/Loading'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: UserRole[]
  redirectTo?: string
}

/**
 * ProtectedRoute component để bảo vệ routes dựa trên role của user
 * 
 * @param children - Component con cần được bảo vệ
 * @param allowedRoles - Mảng các role được phép truy cập
 * @param redirectTo - Route để redirect nếu không có quyền (mặc định: /login)
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  // Hiển thị loading khi đang kiểm tra authentication
  if (loading) {
    return <Loading message="Đang kiểm tra quyền truy cập..." />
  }

  // Nếu chưa đăng nhập, redirect về login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Kiểm tra role
  const hasPermission = allowedRoles.includes(user.role)

  if (!hasPermission) {
    // Redirect về trang phù hợp với role của user
    let defaultRedirect = '/'
    
    if (user.role === UserRole.ADMIN) {
      defaultRedirect = '/admin/dashboard'
    } else if (user.role === UserRole.HOSTELOWNER || user.role === UserRole.HOSTEL_OWNER) {
      defaultRedirect = '/owner/dashboard'
    }

    return <Navigate to={defaultRedirect} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

