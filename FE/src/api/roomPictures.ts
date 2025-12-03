import apiClient from './axios'
import type { RoomPicture } from '../types'

export interface CreateRoomPicturePayload {
  roomId: number
  pictureUrl: string
  pictureDescription?: string
  isPrimary?: boolean
  displayOrder?: number
}

export const roomPictureApi = {
  create: async (payload: CreateRoomPicturePayload): Promise<RoomPicture> => {
    const response = await apiClient.post('/room-pictures', {
      roomId: payload.roomId,
      pictureUrl: payload.pictureUrl,
      pictureDescription: payload.pictureDescription,
      isPrimary: payload.isPrimary ?? false,
      displayOrder: payload.displayOrder ?? 0,
    })
    return response.data as RoomPicture
  },

  update: async (
    pictureId: number,
    payload: Partial<{ pictureUrl: string; pictureDescription?: string; isPrimary?: boolean; displayOrder?: number }>
  ): Promise<RoomPicture> => {
    const response = await apiClient.put(`/room-pictures/${pictureId}`, payload)
    return response.data as RoomPicture
  },

  delete: async (pictureId: number): Promise<void> => {
    await apiClient.delete(`/room-pictures/${pictureId}`)
  },

  listByRoom: async (roomId: number): Promise<RoomPicture[]> => {
    const response = await apiClient.get('/room-pictures', { params: { roomId } })
    const data = Array.isArray(response.data) ? response.data : []
    return data as RoomPicture[]
  },
}


