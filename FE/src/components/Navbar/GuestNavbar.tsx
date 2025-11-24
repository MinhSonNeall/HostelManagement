import { Link, useLocation } from 'react-router-dom'
import './GuestNavbar.css'

const GuestNavbar = () => {
  const location = useLocation()
  
  return (
    <nav className="guest-navbar">
      <div className="nav-container">
        <div className="logo">
          <Link to="/">🏠 Trọ Tốt</Link>
        </div>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Trang chủ
          </Link>
          <Link to="/rooms" className={location.pathname === '/rooms' ? 'active' : ''}>
            Tìm phòng
          </Link>
          <Link to="/login" className="login-btn">
            Đăng nhập
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default GuestNavbar