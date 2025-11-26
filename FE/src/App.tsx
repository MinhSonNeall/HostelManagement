import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Layout from './components/Layout/Layout'
import GuestLayout from './components/Layout/GuestLayout'
import Notification from './components/Notification/Notification'
import GuestHome from './pages/Home/GuestHome'
import HostelOwnerDashboard from './pages/HostelOwnerDashboard/HostelOwnerDashboard'
import Rooms from './pages/Rooms/Rooms'
import RoomList from './pages/Rooms/RoomList'
import RoomDetail from './pages/Rooms/RoomDetail'
import RoomManagement from './pages/RoomManagement/RoomManagement'
import CreateRoom from './pages/RoomManagement/CreateRoom'
import UpdateRoom from './pages/RoomManagement/UpdateRoom'
import Tenants from './pages/Tenants/Tenants'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Notification />
          <Routes>
            {/* Routes cho Guest */}
            <Route path="/" element={<GuestLayout><GuestHome /></GuestLayout>} />
            <Route path="/login" element={<GuestLayout><Login /></GuestLayout>} />
            <Route path="/register" element={<GuestLayout><Register /></GuestLayout>} />
            <Route path="/rooms" element={<GuestLayout><Rooms /></GuestLayout>} />
            <Route path="/roomlist" element={<GuestLayout><RoomList /></GuestLayout>} />
            <Route path="/rooms/:id" element={<GuestLayout><RoomDetail /></GuestLayout>} />

            {/* Routes cho Admin */}
            <Route path="/owner/dashboard" element={<Layout><HostelOwnerDashboard /></Layout>} />
            <Route path="/owner/tenants" element={<Layout><Tenants /></Layout>} />
            <Route path="/owner/rooms" element={<Layout><RoomManagement /></Layout>} />
            <Route path="/owner/rooms/create" element={<Layout><CreateRoom /></Layout>} />
            <Route path="/owner/rooms/update/:id" element={<Layout><UpdateRoom /></Layout>} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App