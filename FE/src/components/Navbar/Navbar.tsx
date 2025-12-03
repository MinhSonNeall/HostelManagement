import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { UserRole } from '../../types'
import './Navbar.css'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()
  const [isPopupOpen, setPopupOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : ''
  }

  const displayName = user?.fullName || user?.username || 'User'
  const formattedBalance =
    typeof user?.balance === 'number'
      ? user.balance.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
      : 'Chưa cập nhật'

  // Đóng popup khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setPopupOpen(false)
      }
    }

    if (isPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isPopupOpen])

  // Đóng popup khi nhấn ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPopupOpen(false)
      }
    }

    if (isPopupOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isPopupOpen])

  useEffect(() => {
    setPopupOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    setPopupOpen(false)
    navigate('/login')
  }

  const handlePersonalInfo = () => {
    setPopupOpen(false)
    navigate('/profile')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link 
          to={user?.role === UserRole.ADMIN ? "/admin/dashboard" : 
              (user?.role === UserRole.HOSTELOWNER || user?.role === UserRole.HOSTEL_OWNER) ? "/owner/dashboard" : 
              "/"} 
          className="navbar-brand"
        >
          Quản Lý Trọ
        </Link>
        <ul className="navbar-menu">
          {user?.role === UserRole.ADMIN ? (
            <>
              <li>
                <Link to="/admin/dashboard" className={`navbar-link ${isActive('/admin/dashboard')}`}>
                  Trang Chủ
                </Link>
              </li>
              <li>
                <Link to="/admin/users" className={`navbar-link ${isActive('/admin/users')}`}>
                  Quản lý tài khoản
                </Link>
              </li>
              <li>
                <Link to="/admin/reviews" className={`navbar-link ${isActive('/admin/reviews')}`}>
                  Quản lý đánh giá
                </Link>
              </li>
              <li>
                <Link to="/admin/hostels" className={`navbar-link ${isActive('/admin/hostels')}`}>
                  Quản lý nhà trọ
                </Link>
              </li>
            </>
          ) : (
            // Hiển thị menu cho HOSTELOWNER hoặc HOSTEL_OWNER
              (user?.role === UserRole.HOSTELOWNER || user?.role === UserRole.HOSTEL_OWNER) ? (
              <>
                <li>
                  <Link to="/owner/dashboard" className={`navbar-link ${isActive('/owner/dashboard')}`}>
                    Trang Chủ
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/owner/hostels" 
                    className={`navbar-link ${isActive('/owner/hostels')}`}
                  >
                    Dãy Trọ
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/owner/rooms" 
                    className={`navbar-link ${isActive('/owner/rooms')}`}
                  >
                    Phòng Trọ
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/owner/media" 
                    className={`navbar-link ${isActive('/owner/media')}`}
                  >
                    Thư viện ảnh
                  </Link>
                </li>
                <li>
                  <Link to="/owner/tenants" className={`navbar-link ${isActive('/owner/tenants')}`}>
                    Khách Thuê
                  </Link>
                </li>
              </>
            ) : (
              // Menu cho GUEST hoặc các role khác
              <>
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
              </>
            )
          )}
        </ul>
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-popup-container">
              <button
                ref={buttonRef}
                className="user-menu-button"
                onClick={() => setPopupOpen(!isPopupOpen)}
              >
                Chào mừng, {displayName}
              </button>
              {isPopupOpen && (
                <div className="user-popup" ref={popupRef}>
                  <div className="popup-header">
                    <h3>Thông tin tài khoản</h3>
                    <button 
                      className="popup-close"
                      onClick={() => setPopupOpen(false)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="popup-content">
                    <div className="user-info">
                      <div className="info-item">
                        <span className="info-label">Tên người dùng:</span>
                        <span className="info-value">{displayName}</span>
                      </div>
                      {user?.email && (
                        <div className="info-item">
                          <span className="info-label">Email:</span>
                          <span className="info-value">{user.email}</span>
                        </div>
                      )}
                      {user?.role === UserRole.CUSTOMER && user.balance !== undefined && (
                        <div className="info-item balance">
                          <span className="info-label">Số dư tài khoản:</span>
                          <span className="info-value balance-value">{formattedBalance}</span>
                        </div>
                      )}
                    </div>
                    <div className="popup-actions">
                      <button 
                        className="popup-btn primary"
                        onClick={handlePersonalInfo}
                      >
                        Thông tin cá nhân
                      </button>
                      <button 
                        className="popup-btn logout"
                        onClick={handleLogout}
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
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

