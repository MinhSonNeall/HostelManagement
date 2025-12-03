import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuth } from '../../contexts/AuthContext'
import { UserRole } from '../../types'
import './Register.css'

const Register = () => {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    // Role trong DB: GUEST hoặc HOSTELOWNER, mặc định GUEST
    role: UserRole.GUEST as UserRole,
  })
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

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

      // Cập nhật AuthContext với user mới đăng ký
      // authApi.register() đã tự động login và lưu vào localStorage rồi,
      // chỉ cần cập nhật state trong AuthContext
      setUser(response.user)

      // Redirect dựa trên role trả về từ backend (GUEST / HOSTELOWNER / ADMIN)
      if (response.user.role === UserRole.HOSTELOWNER || response.user.role === UserRole.HOSTEL_OWNER) {
        navigate('/owner/dashboard')
      } else if (response.user.role === UserRole.ADMIN) {
        navigate('/admin/dashboard')
      } else {
        // GUEST hoặc các role khác về trang chủ
        navigate('/')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register">
      <div className="register-container">
        <h1>Đăng Ký</h1>
        <form onSubmit={handleSubmit} className="register-form">
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

