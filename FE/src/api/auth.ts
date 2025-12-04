import apiClient from './axios'
import type { User } from '../types'
import { UserRole } from '../types'

export interface LoginCredentials {
  email: string
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
  // Đăng nhập - sử dụng backend API
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      })

      const { token, user: backendUser } = response.data

      // Map backend user to frontend User format
      const userData: User = {
        id: String(backendUser.id),
        username: backendUser.username || backendUser.email,
        email: backendUser.email,
        role: backendUser.role as UserRole,
        fullName: backendUser.fullName,
        balance: backendUser.balance,
        isActive: backendUser.isActive,
      }

      // Lưu token vào localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))

      return {
        token,
        user: userData,
      }
    } catch (error: any) {
      // Xử lý lỗi từ backend
      if (error.response?.data?.message) {
        const newError: any = new Error(error.response.data.message)
        newError.response = error.response
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

  // Đăng ký tài khoản mới - gửi OTP
  register: async (data: RegisterData): Promise<{ message: string; success: boolean; email: string }> => {
    try {
      // Gọi API đăng ký từ backend để gửi OTP
      const registerResponse = await apiClient.post('/auth/register', {
        fullName: data.fullName || data.username,
        email: data.email || data.username,
        phoneNumber: data.phoneNumber || '',
        password: data.password,
        role: data.role || 'GUEST',
      })

      return registerResponse.data
    } catch (error: any) {
      // Xử lý lỗi từ backend
      if (error.response?.data?.message) {
        const newError: any = new Error(error.response.data.message)
        newError.response = error.response
        throw newError
      }
      throw error
    }
  },

  // Xác thực OTP và hoàn tất đăng ký
  verifyRegisterOTP: async (email: string, otp: string, password: string): Promise<LoginResponse> => {
    try {
      // Gọi API verify OTP
      const verifyResponse = await apiClient.post('/auth/verify-register-otp', {
        email,
        otp,
      })

      const backendUser = verifyResponse.data.user

      // Sau khi verify thành công, tự động đăng nhập
      const loginResponse = await authApi.login({
        email: backendUser.email,
        password: password,
      })

      return loginResponse
    } catch (error: any) {
      // Xử lý lỗi từ backend
      if (error.response?.data?.message) {
        const newError: any = new Error(error.response.data.message)
        newError.response = error.response
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

