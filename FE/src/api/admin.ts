import apiClient from './axios'

export interface AdminUser {
  id: string
  fullName: string
  email: string
  phoneNumber?: string
  role: string
  balance: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AdminReview {
  reviewId: number
  roomId: number
  customerId: number
  rating: number
  comment?: string
  createdAt?: string
  updatedAt?: string
}

export interface AdminHostel {
  hostelId: number
  ownerId: number
  hostelName: string
  address: string
  ward?: string
  district?: string
  city?: string
  description?: string
  totalFloors: number
  totalRooms: number
  createdAt?: string
  updatedAt?: string
}

export interface DashboardStats {
  totalUsers: number
  totalHostels: number
  totalReviews: number
}

export interface UpdateUserData {
  fullName?: string
  email?: string
  phoneNumber?: string
  role?: string
  balance?: number
  isActive?: boolean
}

export const adminApi = {
  // Get dashboard stats
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/admin')
    return response.data
  },

  // User management
  getAllUsers: async (): Promise<AdminUser[]> => {
    const response = await apiClient.get('/admin/users')
    return response.data
  },

  getUserById: async (userId: number): Promise<AdminUser> => {
    const response = await apiClient.get(`/admin/users/${userId}`)
    return response.data
  },

  updateUser: async (userId: number, data: UpdateUserData): Promise<void> => {
    await apiClient.put(`/admin/users/${userId}`, data)
  },

  updateUserPassword: async (userId: number, password: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/password`, { password })
  },

  activateUser: async (userId: number): Promise<void> => {
    await apiClient.put(`/admin/users/${userId}/activate`)
  },

  deactivateUser: async (userId: number): Promise<void> => {
    await apiClient.put(`/admin/users/${userId}/deactivate`)
  },

  // Review/Comment management
  getAllReviews: async (): Promise<AdminReview[]> => {
    const response = await apiClient.get('/admin/reviews')
    return response.data
  },

  getReviewById: async (reviewId: number): Promise<AdminReview> => {
    const response = await apiClient.get(`/admin/reviews/${reviewId}`)
    return response.data
  },

  deleteReview: async (reviewId: number): Promise<void> => {
    await apiClient.delete(`/admin/reviews/${reviewId}`)
  },

  // Hostel/Post management
  getAllHostels: async (): Promise<AdminHostel[]> => {
    const response = await apiClient.get('/admin/hostels')
    return response.data
  },

  getHostelById: async (hostelId: number): Promise<AdminHostel> => {
    const response = await apiClient.get(`/admin/hostels/${hostelId}`)
    return response.data
  },

  deleteHostel: async (hostelId: number): Promise<void> => {
    await apiClient.delete(`/admin/hostels/${hostelId}`)
  },
}

