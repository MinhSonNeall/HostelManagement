import { ReactNode } from 'react'
import ProtectedRoute from './ProtectedRoute'
import { UserRole } from '../../types'

interface HostelOwnerRouteProps {
  children: ReactNode
}

/**
 * HostelOwnerRoute - Chỉ cho phép HOSTELOWNER hoặc HOSTEL_OWNER truy cập
 */
const HostelOwnerRoute = ({ children }: HostelOwnerRouteProps) => {
  return (
    <ProtectedRoute 
      allowedRoles={[UserRole.HOSTELOWNER, UserRole.HOSTEL_OWNER]}
    >
      {children}
    </ProtectedRoute>
  )
}

export default HostelOwnerRoute

