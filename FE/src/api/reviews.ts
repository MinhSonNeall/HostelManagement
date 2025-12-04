import apiClient from './axios'

export interface Review {
  reviewId: number
  roomId: number
  customerId: number
  rating: number
  comment?: string
  createdAt?: string
  updatedAt?: string
  customerName?: string // Thêm từ backend nếu có
}

export interface CreateReviewPayload {
  roomId: number
  customerId: number
  rating: number
  comment?: string
}

export const reviewApi = {
  // Lấy danh sách reviews theo roomId
  getByRoomId: async (roomId: number): Promise<Review[]> => {
    const response = await apiClient.get('/reviews', {
      params: { roomId },
    })
    const data = response.data
    return Array.isArray(data) ? data : []
  },

  // Lấy danh sách reviews theo customerId
  getByCustomerId: async (customerId: number): Promise<Review[]> => {
    const response = await apiClient.get('/reviews', {
      params: { customerId },
    })
    const data = response.data
    return Array.isArray(data) ? data : []
  },

  // Tạo review mới
  create: async (payload: CreateReviewPayload): Promise<Review> => {
    const response = await apiClient.post('/reviews', {
      roomId: payload.roomId,
      customerId: payload.customerId,
      rating: payload.rating,
      comment: payload.comment || '',
    })
    return response.data as Review
  },
}

