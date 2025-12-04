import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { UserRole } from '../../types'
import './Login.css'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login({ email, password })
      
      // Redirect dựa trên role (khớp với DB: ADMIN, HOSTELOWNER, GUEST)
      if (user.role === UserRole.ADMIN) {
        navigate('/admin/dashboard')
      } else if (user.role === UserRole.HOSTELOWNER) {
        navigate('/owner/dashboard')
      } else {
        // GUEST hoặc các role khác
        navigate('/')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login-container">
        <h1>Đăng Nhập</h1>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>
        <div className="login-links">
          <div className="forgot-password-link">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>
        <div className="register-link">
          <span>Chưa có tài khoản? </span>
          <Link to="/register">Đăng ký</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

