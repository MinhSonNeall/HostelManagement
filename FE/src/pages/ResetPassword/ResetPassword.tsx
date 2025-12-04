import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../../api/axios'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import { UserRole } from '../../types'
import './ResetPassword.css'

const ResetPassword = () => {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Lấy email từ localStorage (đã lưu ở trang forgot password)
    const savedEmail = localStorage.getItem('resetPasswordEmail')
    if (savedEmail) {
      setEmail(savedEmail)
    } else {
      setError('Vui lòng yêu cầu mã OTP trước.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!email) {
      const errorMsg = 'Email không hợp lệ. Vui lòng yêu cầu mã OTP mới.'
      setError(errorMsg)
      showNotification(errorMsg, 'error')
      return
    }

    if (otp.length !== 6) {
      const errorMsg = 'Mã OTP phải có 6 chữ số.'
      setError(errorMsg)
      showNotification(errorMsg, 'error')
      return
    }

    if (password.length < 6) {
      const errorMsg = 'Mật khẩu phải có ít nhất 6 ký tự.'
      setError(errorMsg)
      showNotification(errorMsg, 'error')
      return
    }

    if (password !== confirmPassword) {
      const errorMsg = 'Mật khẩu xác nhận không khớp.'
      setError(errorMsg)
      showNotification(errorMsg, 'error')
      return
    }

    setLoading(true)

    try {
      // Reset password
      const response = await apiClient.post('/auth/reset-password', {
        email,
        otp,
        password,
      })
      
      // Xóa email khỏi localStorage
      localStorage.removeItem('resetPasswordEmail')
      
      // Hiển thị thông báo thành công
      showNotification(
        response.data.message || 'Đặt lại mật khẩu thành công! Đang đăng nhập...',
        'success'
      )
      
      // Tự động đăng nhập với email và password mới
      try {
        const user = await login({ email, password })
        
        // Redirect dựa trên role
        setTimeout(() => {
          if (user.role === UserRole.ADMIN) {
            navigate('/admin/dashboard')
          } else if (user.role === UserRole.HOSTELOWNER) {
            navigate('/owner/dashboard')
          } else {
            navigate('/')
          }
        }, 1000)
      } catch (loginError: any) {
        // Nếu đăng nhập thất bại, chuyển đến trang login
        showNotification(
          'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.',
          'info'
        )
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.'
      setError(errorMsg)
      showNotification(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reset-password">
      <div className="reset-password-container">
        <h1>Đặt Lại Mật Khẩu</h1>
        <p className="reset-password-description">
          Nhập mã OTP đã được gửi đến email của bạn và mật khẩu mới.
        </p>
        <form onSubmit={handleSubmit} className="reset-password-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!localStorage.getItem('resetPasswordEmail')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="otp">Mã OTP</label>
            <input
              type="text"
              id="otp"
              name="otp"
              placeholder="Nhập mã OTP 6 chữ số"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                setOtp(value)
              }}
              required
              maxLength={6}
              className="otp-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu mới</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="reset-password-button" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
          </button>
        </form>
        <div className="reset-password-links">
          <Link to="/forgot-password">Gửi lại mã OTP</Link>
          <span> | </span>
          <Link to="/login">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

