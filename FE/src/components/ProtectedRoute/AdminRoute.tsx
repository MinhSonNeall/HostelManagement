import { ReactNode } from 'react'
import ProtectedRoute from './ProtectedRoute'
import { UserRole } from '../../types'

interface AdminRouteProps {
  children: ReactNode
}

/**
 * AdminRoute - Chỉ cho phép ADMIN truy cập
 */
const AdminRoute = ({ children }: AdminRouteProps) => {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      {children}
    </ProtectedRoute>
  )
}

export default AdminRoute

