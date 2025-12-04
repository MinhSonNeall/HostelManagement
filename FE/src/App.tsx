import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Layout from './components/Layout/Layout'
import GuestLayout from './components/Layout/GuestLayout'
import Notification from './components/Notification/Notification'
import { AdminRoute, HostelOwnerRoute, PublicRoute, ProtectedRoute } from './components/ProtectedRoute'
import GuestHome from './pages/Home/GuestHome'
import HostelOwnerDashboard from './pages/HostelOwnerDashboard/HostelOwnerDashboard'
import Rooms from './pages/Rooms/Rooms'
import RoomList from './pages/Rooms/RoomList'
import RoomDetail from './pages/Rooms/RoomDetail'
import RoomManagement from './pages/RoomManagement/RoomManagement'
import CreateRoom from './pages/RoomManagement/CreateRoom'
import UpdateRoom from './pages/RoomManagement/UpdateRoom'
import CreateHostel from './pages/RoomManagement/CreateHostel'
import EditHostel from './pages/RoomManagement/EditHostel'
import OwnerHostels from './pages/RoomManagement/OwnerHostels'
import Tenants from './pages/Tenants/Tenants'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import ForgotPassword from './pages/ForgotPassword/ForgotPassword'
import ResetPassword from './pages/ResetPassword/ResetPassword'
import Payment from './pages/Payment/Payment'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import AdminUsers from './pages/AdminUsers/AdminUsers'
import AdminReviews from './pages/AdminReviews/AdminReviews'
import AdminHostels from './pages/AdminHostels/AdminHostels'
import CloudinaryLibrary from './pages/CloudinaryLibrary/CloudinaryLibrary'
import Profile from './pages/Profile/Profile'
import { UserRole } from './types'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Notification />
          <Routes>
            {/* Public Routes - Tất cả đều có thể truy cập, nhưng chặn Admin và Owner */}
            <Route 
              path="/" 
              element={
                <PublicRoute blockAdminAndOwner={true}>
                  <GuestLayout><GuestHome /></GuestLayout>
                </PublicRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                <PublicRoute redirectIfAuthenticated="dashboard">
                  <GuestLayout><Login /></GuestLayout>
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute redirectIfAuthenticated="dashboard">
                  <GuestLayout><Register /></GuestLayout>
                </PublicRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute redirectIfAuthenticated="dashboard">
                  <GuestLayout><ForgotPassword /></GuestLayout>
                </PublicRoute>
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                <PublicRoute redirectIfAuthenticated="dashboard">
                  <GuestLayout><ResetPassword /></GuestLayout>
                </PublicRoute>
              } 
            />
            <Route 
              path="/rooms" 
              element={
                <PublicRoute>
                  <GuestLayout><Rooms /></GuestLayout>
                </PublicRoute>
              } 
            />
            <Route 
              path="/roomlist" 
              element={
                <PublicRoute>
                  <GuestLayout><RoomList /></GuestLayout>
                </PublicRoute>
              } 
            />
            <Route 
              path="/rooms/:id" 
              element={
                <PublicRoute>
                  <GuestLayout><RoomDetail /></GuestLayout>
                </PublicRoute>
              } 
            />
            <Route 
              path="/payment/:bookingId" 
              element={
                <ProtectedRoute allowedRoles={[UserRole.GUEST, UserRole.CUSTOMER]}>
                  <GuestLayout><Payment /></GuestLayout>
                </ProtectedRoute>
              } 
            />

            {/* Protected Routes cho Hostel Owner */}
            <Route 
              path="/owner/dashboard" 
              element={
                <HostelOwnerRoute>
                  <Layout><HostelOwnerDashboard /></Layout>
                </HostelOwnerRoute>
              } 
            />
            <Route 
              path="/owner/tenants" 
              element={
                <HostelOwnerRoute>
                  <Layout><Tenants /></Layout>
                </HostelOwnerRoute>
              } 
            />
            <Route 
              path="/owner/rooms" 
              element={
                <HostelOwnerRoute>
                  <Layout><RoomManagement /></Layout>
                </HostelOwnerRoute>
              } 
            />
            <Route 
              path="/owner/rooms/create" 
              element={
                <HostelOwnerRoute>
                  <Layout><CreateRoom /></Layout>
                </HostelOwnerRoute>
              } 
            />
            <Route 
              path="/owner/hostels" 
              element={
                <HostelOwnerRoute>
                  <Layout><OwnerHostels /></Layout>
                </HostelOwnerRoute>
              } 
            />
            <Route 
              path="/owner/hostels/create" 
              element={
                <HostelOwnerRoute>
                  <Layout><CreateHostel /></Layout>
                </HostelOwnerRoute>
              } 
            />
            <Route 
              path="/owner/hostels/:id/edit" 
              element={
                <HostelOwnerRoute>
                  <Layout><EditHostel /></Layout>
                </HostelOwnerRoute>
              } 
            />
            <Route 
              path="/owner/rooms/update/:id" 
              element={
                <HostelOwnerRoute>
                  <Layout><UpdateRoom /></Layout>
                </HostelOwnerRoute>
              } 
            />
            <Route 
              path="/owner/media" 
              element={
                <HostelOwnerRoute>
                  <Layout><CloudinaryLibrary /></Layout>
                </HostelOwnerRoute>
              } 
            />

            {/* Protected Routes cho Admin */}
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminRoute>
                  <Layout><AdminDashboard /></Layout>
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminRoute>
                  <Layout><AdminUsers /></Layout>
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/reviews" 
              element={
                <AdminRoute>
                  <Layout><AdminReviews /></Layout>
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/hostels" 
              element={
                <AdminRoute>
                  <Layout><AdminHostels /></Layout>
                </AdminRoute>
              } 
            />

            {/* Profile cho tất cả user đã đăng nhập */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute
                  allowedRoles={[
                    UserRole.ADMIN,
                    UserRole.HOSTELOWNER,
                    UserRole.HOSTEL_OWNER,
                    UserRole.GUEST,
                    UserRole.CUSTOMER,
                  ]}
                >
                  <Layout><Profile /></Layout>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App