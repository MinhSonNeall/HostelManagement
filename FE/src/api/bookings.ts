import apiClient from './axios'

export interface Booking {
  bookingId: number
  roomId: number
  customerId: number
  startDate: string
  endDate?: string
  bookingStatus: string
  totalPrice: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateBookingPayload {
  roomId: number
  customerId: number
  startDate: string
  endDate?: string
  bookingStatus?: string
  totalPrice: number
}

export const bookingApi = {
  create: async (payload: CreateBookingPayload): Promise<Booking> => {
    try {
      console.log('Creating booking with payload:', payload)
      const response = await apiClient.post('/bookings', {
        roomId: payload.roomId,
        customerId: payload.customerId,
        startDate: payload.startDate,
        endDate: payload.endDate,
        bookingStatus: payload.bookingStatus || 'PENDING',
        totalPrice: payload.totalPrice,
      })
      console.log('Booking response:', response.data)
      
      // Kiểm tra response có đúng format không
      if (!response.data || !response.data.bookingId) {
        throw new Error('Invalid response format from server')
      }
      
      return response.data as Booking
    } catch (error: any) {
      console.error('Error creating booking:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      throw error
    }
  },

  getById: async (bookingId: number): Promise<Booking> => {
    const response = await apiClient.get('/bookings', {
      params: { id: bookingId },
    })
    return response.data as Booking
  },

  getByCustomerId: async (customerId: number): Promise<Booking[]> => {
    const response = await apiClient.get('/bookings', {
      params: { customerId },
    })
    const data = response.data
    return Array.isArray(data) ? data : []
  },

  getByRoomId: async (roomId: number): Promise<Booking[]> => {
    const response = await apiClient.get('/bookings', {
      params: { roomId },
    })
    const data = response.data
    return Array.isArray(data) ? data : []
  },
}

