import { ReactNode } from 'react'
import ProtectedRoute from './ProtectedRoute'
import { UserRole } from '../../types'

interface GuestRouteProps {
  children: ReactNode
  allowAuthenticated?: boolean // Cho phép user đã đăng nhập truy cập (mặc định: true)
}

/**
 * GuestRoute - Cho phép GUEST và các role khác truy cập (public routes)
 * Nếu allowAuthenticated = false, chỉ cho phép user chưa đăng nhập
 */
const GuestRoute = ({ children, allowAuthenticated = true }: GuestRouteProps) => {
  if (!allowAuthenticated) {
    // Route chỉ dành cho user chưa đăng nhập (như login, register)
    return (
      <ProtectedRoute 
        allowedRoles={[UserRole.GUEST, UserRole.ADMIN, UserRole.HOSTELOWNER, UserRole.HOSTEL_OWNER, UserRole.CUSTOMER]}
        redirectTo="/"
      >
        {children}
      </ProtectedRoute>
    )
  }

  // Public route - tất cả role đều có thể truy cập
  return (
    <ProtectedRoute 
      allowedRoles={[UserRole.GUEST, UserRole.ADMIN, UserRole.HOSTELOWNER, UserRole.HOSTEL_OWNER, UserRole.CUSTOMER]}
    >
      {children}
    </ProtectedRoute>
  )
}

export default GuestRoute

