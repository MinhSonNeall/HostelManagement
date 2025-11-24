import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './GuestNavbar.css'
import { useAuth } from '../../contexts/AuthContext'

const GuestNavbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [isPopupOpen, setPopupOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  const displayName = user?.fullName || user?.username || 'Người dùng'
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

  const handleProfile = () => {
    setPopupOpen(false)
    navigate('/profile')
  }
  
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
          {isAuthenticated ? (
            <div className="user-popup-container">
              <button
                ref={buttonRef}
                className="user-trigger"
                onClick={() => setPopupOpen(!isPopupOpen)}
              >
                Chào mừng: {displayName}
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
                      <div className="info-item balance">
                        <span className="info-label">Số dư tài khoản:</span>
                        <span className="info-value balance-value">{formattedBalance}</span>
                      </div>
                    </div>
                    <div className="popup-actions">
                      <button 
                        className="popup-btn primary"
                        onClick={handleProfile}
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
            <Link to="/login" className="login-btn">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default GuestNavbar