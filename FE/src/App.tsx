import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import GuestLayout from './components/Layout/GuestLayout'
import Home from './pages/Home/Home'
import GuestHome from './pages/Home/GuestHome'
<<<<<<< HEAD
import Rooms from './pages/Rooms/Rooms'
import RoomList from './pages/Rooms/Roomlist'
import RoomDetail from './pages/Rooms/RoomDetail' 
import Tenants from './pages/Tenants/Tenants'
=======
>>>>>>> 142f5b4e8bbffa28f4f5cc551a302e7e61bf359f
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes cho Guest */}
          <Route path="/" element={<GuestLayout><GuestHome /></GuestLayout>} />
          <Route path="/login" element={<GuestLayout><Login /></GuestLayout>} />
          <Route path="/rooms" element={<GuestLayout><Rooms /></GuestLayout>} />
          <Route path="/roomlist" element={<GuestLayout><RoomList /></GuestLayout>} />
          <Route path="/rooms/:id" element={<GuestLayout><RoomDetail /></GuestLayout>} />

<<<<<<< HEAD
          {/* Routes cho Admin */}
          <Route path="/owner/dashboard" element={<Layout><Home /></Layout>} />
          <Route path="/owner/tenants" element={<Layout><Tenants /></Layout>} />
        </Routes>
      </Router>
=======
<AuthProvider>
    <Router>
      <Routes>
        {/* Routes cho Guest */}
        <Route path="/" element={<GuestLayout><GuestHome /></GuestLayout>} />
        <Route path="/login" element={<GuestLayout><Login /></GuestLayout>} />
        <Route path="/register" element={<GuestLayout><Register /></GuestLayout>} />

        {/* Routes cho Admin */}
        <Route path="/owner/dashboard" element={<Layout><Home /></Layout>} />
        
      </Routes>
    </Router>
>>>>>>> 142f5b4e8bbffa28f4f5cc551a302e7e61bf359f
    </AuthProvider>
  )
}

export default App