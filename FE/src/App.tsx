import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import GuestLayout from './components/Layout/GuestLayout'
import Home from './pages/Home/Home'
import GuestHome from './pages/Home/GuestHome'
import Rooms from './pages/Rooms/Rooms'
import Tenants from './pages/Tenants/Tenants'
import Login from './pages/Login/Login'
import './App.css'

function App() {
  return (

<AuthProvider>
    <Router>
      <Routes>
        {/* Routes cho Guest */}
        <Route path="/" element={<GuestLayout><GuestHome /></GuestLayout>} />
        <Route path="/login" element={<GuestLayout><Login /></GuestLayout>
        } />

        {/* Routes cho Admin */}
        <Route path="/owner/dashboard" element={<Layout><Home /></Layout>} />
        
      </Routes>
    </Router>
    </AuthProvider>
  )
}

export default App