import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../../api/axios'
import { useNotification } from '../../contexts/NotificationContext'
import './ForgotPassword.css'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiClient.post('/auth/forgot-password', { email })
      
      // Kiểm tra response có success không
      if (response.data && (response.data.success !== false)) {
        // Lưu email vào localStorage để dùng ở trang reset password
        localStorage.setItem('resetPasswordEmail', email)
        // Hiển thị thông báo thành công bằng NotificationProvider
        showNotification(
          response.data.message || 'Đã gửi mã OTP đến email của bạn. Vui lòng kiểm tra hộp thư.',
          'success'
        )
        // Đợi 2 giây để người dùng đọc thông báo, sau đó redirect
        setTimeout(() => {
          navigate('/reset-password')
        }, 2000)
      } else {
        const errorMsg = response.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.'
        setError(errorMsg)
        showNotification(errorMsg, 'error')
      }
    } catch (err: any) {
      console.error('Forgot password error:', err)
      console.error('Error response:', err.response)
      console.error('Error data:', err.response?.data)
      
      // Kiểm tra nếu response có data nhưng vẫn throw error
      if (err.response?.data?.message) {
        const errorMsg = err.response.data.message
        setError(errorMsg)
        showNotification(errorMsg, 'error')
      } else if (err.response?.status === 200 && err.response?.data) {
        // Nếu status 200 nhưng vẫn vào catch, có thể là do response format
        localStorage.setItem('resetPasswordEmail', email)
        showNotification('Đã gửi mã OTP đến email của bạn. Vui lòng kiểm tra hộp thư.', 'success')
        // Đợi 2 giây trước khi redirect
        setTimeout(() => {
          navigate('/reset-password')
        }, 2000)
      } else {
        const errorMsg = err.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.'
        setError(errorMsg)
        showNotification(errorMsg, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-password">
      <div className="forgot-password-container">
        <h1>Quên Mật Khẩu</h1>
        <p className="forgot-password-description">
          Nhập email đã đăng ký của bạn. Chúng tôi sẽ gửi mã OTP đến email đó để đặt lại mật khẩu.
        </p>
        <form onSubmit={handleSubmit} className="forgot-password-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Nhập email đã đăng ký"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="forgot-password-button" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi Mã OTP'}
          </button>
        </form>
        <div className="forgot-password-links">
          <Link to="/login">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

