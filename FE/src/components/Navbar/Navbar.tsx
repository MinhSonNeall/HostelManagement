import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { UserRole } from '../../types'
import './Navbar.css'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : ''
  }

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleLogout = async () => {
    await logout()
    setShowDropdown(false)
    navigate('/login')
  }

  const handlePersonalInfo = () => {
    setShowDropdown(false)
    // Có thể navigate đến trang thông tin cá nhân sau này
    alert('Tính năng thông tin cá nhân đang được phát triển')
  }

  const displayName = user?.fullName || user?.username || 'User'

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
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className="user-menu-button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                Chào mừng, {displayName}
              </button>
              {showDropdown && (
                <div className="user-dropdown">
                  <button
                    className="dropdown-item"
                    onClick={handlePersonalInfo}
                  >
                    Thông tin cá nhân
                  </button>
                  {user?.role === UserRole.CUSTOMER && user.balance !== undefined && (
                    <div className="dropdown-item balance-item">
                      Số dư tài khoản: {user.balance.toLocaleString('vi-VN')} VNĐ
                    </div>
                  )}
                  <button
                    className="dropdown-item"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={`navbar-button ${isActive('/login')}`}>
              Đăng Nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

