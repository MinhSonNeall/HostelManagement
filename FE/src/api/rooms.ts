import apiClient from './axios'
import type { Room } from '../types'

// API functions cho Rooms
export const roomApi = {
  // Lấy danh sách tất cả phòng
  getAll: async (): Promise<Room[]> => {
    const response = await apiClient.get<Room[]>('/rooms')
    return response.data
  },

  // Lấy thông tin một phòng theo ID
  getById: async (id: string): Promise<Room> => {
    const response = await apiClient.get<Room>(`/rooms/${id}`)
    return response.data
  },

  // Tạo phòng mới
  create: async (room: Omit<Room, 'id'>): Promise<Room> => {
    const response = await apiClient.post<Room>('/rooms', room)
    return response.data
  },

  // Cập nhật thông tin phòng
  update: async (id: string, room: Partial<Room>): Promise<Room> => {
    const response = await apiClient.put<Room>(`/rooms/${id}`, room)
    return response.data
  },

  // Xóa phòng
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/rooms/${id}`)
  },
}

