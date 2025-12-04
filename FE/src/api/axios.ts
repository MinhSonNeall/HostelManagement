import axios from 'axios'

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999/HostelManagement/api',
  timeout: 30000, // Tăng timeout lên 30 giây để đủ thời gian gửi email
  withCredentials: true, // Cho phép gửi cookies để session hoạt động
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - thêm token vào header nếu có
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - xử lý lỗi chung
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Xử lý lỗi 401 (Unauthorized) - có thể redirect về trang login
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Có thể redirect về trang login ở đây nếu cần
      // window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient

