import apiClient from './axios'
import type { User, UserRole } from '../types'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
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

