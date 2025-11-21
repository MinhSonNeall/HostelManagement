import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import Rooms from './pages/Rooms/Rooms'
import Tenants from './pages/Tenants/Tenants'
import './App.css'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/tenants" element={<Tenants />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

