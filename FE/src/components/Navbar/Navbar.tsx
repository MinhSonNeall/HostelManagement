import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Quản Lý Trọ
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link to="/" className={`navbar-link ${isActive('/')}`}>
              Trang Chủ
            </Link>
          </li>
          <li>
            <Link to="/rooms" className={`navbar-link ${isActive('/rooms')}`}>
              Phòng Trọ
            </Link>
          </li>
          <li>
            <Link to="/tenants" className={`navbar-link ${isActive('/tenants')}`}>
              Khách Thuê
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar

