import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../contexts/NotificationContext'
import { UserRole } from '../../types'
import './Register.css'

const Register = () => {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const { showNotification } = useNotification()
  const [step, setStep] = useState<'register' | 'verify'>('register')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    // Role trong DB: GUEST hoặc HOSTELOWNER, mặc định GUEST
    role: UserRole.GUEST as UserRole,
  })
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          return 'Họ và tên không được để trống'
        }
        return ''
      case 'password':
        if (value.length < 6) {
          return 'Mật khẩu phải có ít nhất 6 ký tự'
        }
        if (!/[A-Z]/.test(value)) {
          return 'Mật khẩu phải có ít nhất một chữ cái in hoa'
        }
        return ''
      case 'confirmPassword':
        if (value !== formData.password) {
          return 'Mật khẩu xác nhận không khớp'
        }
        return ''
      case 'email':
        if (!value.trim()) {
          return 'Email không được để trống'
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Email không đúng định dạng'
        }
        return ''
      case 'phoneNumber':
        if (value && !/^[0-9]{10}$/.test(value)) {
          return 'Số điện thoại phải có đúng 10 chữ số'
        }
        return ''
      default:
        return ''
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Validate field khi người dùng nhập
    const fieldError = validateField(name, value)
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }))
  }

  // Kiểm tra form có hợp lệ không
  const isFormValid = (): boolean => {
    // Kiểm tra các field bắt buộc (phù hợp với backend: fullName, email, password)
    if (!formData.fullName.trim()) return false
    if (!formData.email.trim()) return false
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return false
    if (formData.password.length < 6) return false
    if (!/[A-Z]/.test(formData.password)) return false
    if (formData.confirmPassword.length === 0) return false
    if (formData.password !== formData.confirmPassword) return false

    // Kiểm tra số điện thoại nếu có nhập
    if (formData.phoneNumber && !/^[0-9]{10}$/.test(formData.phoneNumber)) return false

    return true
  }

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    showNotification('', 'info') // Clear previous notifications

    // Validate tất cả các trường
    const newErrors: Record<string, string> = {}

    // Validate fullName
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống'
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng'
    }

    // Validate password
    if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải có ít nhất một chữ cái in hoa'
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }

    // Validate phone number
    if (formData.phoneNumber && !/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại phải có đúng 10 chữ số'
    }

    setErrors(newErrors)

    // Nếu có lỗi, không submit
    if (Object.keys(newErrors).length > 0) {
      setError('Vui lòng kiểm tra lại thông tin đã nhập')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...rest } = formData

      // Backend không có trường username, nhưng interface RegisterData yêu cầu.
      // Dùng email làm username cho phù hợp với DB (Users: FullName, Email, PhoneNumber, PasswordHash, Role,...)
      const registerData = {
        ...rest,
        username: formData.email,
      }

      const response = await authApi.register(registerData)

      if (response.success) {
        // Lưu email và password để dùng ở bước verify
        setRegisterEmail(formData.email)
        setRegisterPassword(formData.password)
        // Chuyển sang bước verify OTP
        setStep('verify')
        showNotification(response.message || 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.', 'success')
      } else {
        setError(response.message || 'Không thể gửi mã OTP. Vui lòng thử lại.')
        showNotification(response.message || 'Không thể gửi mã OTP. Vui lòng thử lại.', 'error')
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      setError(errorMessage)
      showNotification(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    showNotification('', 'info') // Clear previous notifications

    if (otp.length !== 6) {
      setError('Mã OTP phải có 6 chữ số')
      showNotification('Mã OTP phải có 6 chữ số', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await authApi.verifyRegisterOTP(registerEmail, otp, registerPassword)

      // Cập nhật AuthContext với user mới đăng ký
      setUser(response.user)
      showNotification('Đăng ký thành công!', 'success')

      // Redirect dựa trên role trả về từ backend (GUEST / HOSTELOWNER / ADMIN)
      setTimeout(() => {
        if (response.user.role === UserRole.HOSTELOWNER || response.user.role === UserRole.HOSTEL_OWNER) {
          navigate('/owner/dashboard')
        } else if (response.user.role === UserRole.ADMIN) {
          navigate('/admin/dashboard')
        } else {
          // GUEST hoặc các role khác về trang chủ
          navigate('/')
        }
      }, 1000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Xác thực OTP thất bại. Vui lòng thử lại.'
      setError(errorMessage)
      showNotification(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'verify') {
    return (
      <div className="register">
        <div className="register-container">
          <h1>Xác Thực OTP</h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>
            Mã OTP đã được gửi đến email <strong>{registerEmail}</strong>
          </p>
          <form onSubmit={handleVerifySubmit} className="register-form">
            {error && <div className="error-message">{error}</div>}

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
                autoFocus
              />
            </div>

            <button 
              type="submit" 
              className="register-button" 
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Đang xử lý...' : 'Xác Thực'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => {
                  setStep('register')
                  setOtp('')
                  setError('')
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3498db',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '0.9rem',
                }}
              >
                Quay lại đăng ký
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="register">
      <div className="register-container">
        <h1>Đăng Ký</h1>
        <form onSubmit={handleRegisterSubmit} className="register-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="role">Loại tài khoản *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="role-select"
            >
              <option value={UserRole.GUEST}>Người thuê trọ</option>
              <option value={UserRole.HOSTELOWNER}>Chủ trọ</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Họ và tên *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Nhập họ và tên"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Nhập email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Số điện thoại</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="Nhập số điện thoại (10 số)"
              value={formData.phoneNumber}
              onChange={handleChange}
              maxLength={10}
            />
            {errors.phoneNumber && <span className="field-error">{errors.phoneNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu *</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự, có chữ in hoa)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <button 
            type="submit" 
            className="register-button" 
            disabled={loading || !isFormValid()}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </button>
        </form>
        <div className="login-link">
          <span>Đã có tài khoản? </span>
          <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  )
}

export default Register

