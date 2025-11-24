import apiClient from './axios'
import type { User } from '../types'
import { UserRole } from '../types'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterData {
  username: string
  password: string
  email?: string
  fullName?: string
  phoneNumber?: string
  role: UserRole
}

// API functions cho Authentication
export const authApi = {
  // Đăng nhập - tìm user trong db.json
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      // Lấy tất cả users từ json-server
      const response = await apiClient.get('/users')
      const users = response.data

      // Tìm user khớp với username và password
      const user = users.find(
        (u: any) => u.username === credentials.username && u.password === credentials.password
      )

      if (!user) {
        const error: any = new Error('Tên đăng nhập hoặc mật khẩu không đúng')
        error.response = { data: { message: 'Tên đăng nhập hoặc mật khẩu không đúng' } }
        throw error
      }

      // Tạo token đơn giản (trong production nên dùng JWT từ backend)
      const token = `fake-jwt-token-${user.id}-${Date.now()}`

      // Tạo user object theo format User interface
      const userData: User = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role as UserRole,
        fullName: user.fullName,
        balance: user.balance,
      }

      // Lưu token vào localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))

      return {
        token,
        user: userData,
      }
    } catch (error: any) {
      // Nếu là lỗi network hoặc không tìm thấy user
      if (!error.response) {
        const newError: any = new Error('Tên đăng nhập hoặc mật khẩu không đúng')
        newError.response = { data: { message: 'Tên đăng nhập hoặc mật khẩu không đúng' } }
        throw newError
      }
      throw error
    }
  },

  // Đăng xuất
  logout: async (): Promise<void> => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Đăng ký tài khoản mới
  register: async (data: RegisterData): Promise<LoginResponse> => {
    try {
      // Kiểm tra username đã tồn tại chưa
      const response = await apiClient.get('/users')
      const users = response.data

      const existingUser = users.find((u: any) => u.username === data.username)
      if (existingUser) {
        const error: any = new Error('Tên đăng nhập đã tồn tại')
        error.response = { data: { message: 'Tên đăng nhập đã tồn tại' } }
        throw error
      }

      // Tạo user mới
      const newUser = {
        id: `user-${Date.now()}`,
        username: data.username,
        password: data.password,
        email: data.email || '',
        fullName: data.fullName || '',
        phoneNumber: data.phoneNumber || '',
        role: data.role,
        balance: data.role === UserRole.CUSTOMER ? 0 : undefined,
      }

      // Thêm user vào db.json
      await apiClient.post('/users', newUser)

      // Tạo token và đăng nhập tự động
      const token = `fake-jwt-token-${newUser.id}-${Date.now()}`

      const userData: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role as UserRole,
        fullName: newUser.fullName,
        balance: newUser.balance,
      }

      // Lưu token vào localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))

      return {
        token,
        user: userData,
      }
    } catch (error: any) {
      if (!error.response) {
        const newError: any = new Error('Đăng ký thất bại. Vui lòng thử lại.')
        newError.response = { data: { message: 'Đăng ký thất bại. Vui lòng thử lại.' } }
        throw newError
      }
      throw error
    }
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async (): Promise<User> => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Chưa đăng nhập')
    }

    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      return JSON.parse(savedUser)
    }

    throw new Error('Không tìm thấy thông tin user')
  },
}

