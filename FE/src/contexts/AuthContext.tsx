import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, type LoginCredentials } from '../api/auth'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<User>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Kiểm tra token và lấy thông tin user khi app khởi động
    const token = localStorage.getItem('token')
    if (token) {
      // Có thể gọi API để lấy thông tin user
      // Hiện tại chỉ lưu vào state từ localStorage nếu có
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    }
    setLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials): Promise<User> => {
    const response = await authApi.login(credentials)
    setUser(response.user)
    localStorage.setItem('user', JSON.stringify(response.user))
    return response.user
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
    localStorage.removeItem('user')
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

