import apiClient from './axios'
import type { Room, RoomStatus } from '../types'

interface RoomQueryParams {
  hostelId?: number
  status?: RoomStatus
  includePictures?: boolean
}

const normalizeRoom = (data: any): Room => {
  const rawId = data.roomId ?? data.id
  const roomId =
    typeof rawId === 'number' && !Number.isNaN(rawId)
      ? rawId
      : Number(rawId) || Date.now()
  const pricePerMonth = data.pricePerMonth ?? data.price ?? 0
  const areaM2 = data.areaM2 ?? data.area ?? 0
  const status = (data.roomStatus ?? data.status ?? RoomStatus.AVAILABLE) as RoomStatus
  const pictures = Array.isArray(data.pictures) ? data.pictures : []
  const primaryPictureUrl =
    data.primaryPicture?.pictureUrl ??
    pictures.find((pic: any) => pic.isPrimary)?.pictureUrl ??
    data.primaryPictureUrl ??
    data.image ??
    ''

  return {
    id: String(roomId),
    roomId,
    hostelId: data.hostelId,
    roomNumber: data.roomNumber ?? '',
    floor: data.floor ?? 0,
    area: areaM2,
    areaM2,
    price: pricePerMonth,
    pricePerMonth,
    status,
    roomStatus: status,
    description: data.description ?? '',
    depositAmount: data.depositAmount ?? 0,
    maxOccupants: data.maxOccupants ?? 1,
    electricityPricePerKwh: data.electricityPricePerKwh ?? 0,
    waterPricePerM3: data.waterPricePerM3 ?? 0,
    wifiFee: data.wifiFee ?? 0,
    parkingFee: data.parkingFee ?? 0,
    hasAirConditioner: data.hasAirConditioner ?? false,
    hasWaterHeater: data.hasWaterHeater ?? false,
    hasPrivateBathroom: data.hasPrivateBathroom ?? false,
    hasKitchen: data.hasKitchen ?? false,
    allowPet: data.allowPet ?? false,
    pictures,
    primaryPictureUrl,
  }
}

const buildRoomPayload = (room: Partial<Room>): Record<string, any> => ({
  hostelId: room.hostelId,
  roomNumber: room.roomNumber,
  floor: room.floor,
  areaM2: room.area ?? room.areaM2,
  pricePerMonth: room.price ?? room.pricePerMonth,
  depositAmount: room.depositAmount ?? 0,
  maxOccupants: room.maxOccupants ?? 1,
  electricityPricePerKwh: room.electricityPricePerKwh ?? 0,
  waterPricePerM3: room.waterPricePerM3 ?? 0,
  wifiFee: room.wifiFee ?? 0,
  parkingFee: room.parkingFee ?? 0,
  roomStatus: room.status ?? room.roomStatus ?? RoomStatus.AVAILABLE,
  hasAirConditioner: room.hasAirConditioner ?? false,
  hasWaterHeater: room.hasWaterHeater ?? false,
  hasPrivateBathroom: room.hasPrivateBathroom ?? true,
  hasKitchen: room.hasKitchen ?? false,
  allowPet: room.allowPet ?? false,
  description: room.description ?? '',
})

// API functions cho Rooms
export const roomApi = {
  // Lấy danh sách tất cả phòng
  getAll: async (params: RoomQueryParams = {}): Promise<Room[]> => {
    const response = await apiClient.get('/rooms', {
      params: {
        includePictures: true,
        ...params,
      },
    })
    const data = Array.isArray(response.data) ? response.data : []
    return data.map(normalizeRoom)
  },

  // Lấy thông tin một phòng theo ID
  getById: async (id: string | number): Promise<Room> => {
    const response = await apiClient.get(`/rooms/${id}`, {
      params: { includePictures: true },
    })
    return normalizeRoom(response.data)
  },

  // Tạo phòng mới
  create: async (room: Partial<Room>): Promise<Room> => {
    const payload = buildRoomPayload(room)
    const response = await apiClient.post('/rooms', payload)
    return normalizeRoom(response.data)
  },

  // Cập nhật thông tin phòng
  update: async (id: string | number, room: Partial<Room>): Promise<Room> => {
    const payload = buildRoomPayload(room)
    const response = await apiClient.put(`/rooms/${id}`, payload)
    return normalizeRoom(response.data)
  },

  // Cập nhật trạng thái phòng
  updateStatus: async (id: string | number, status: RoomStatus): Promise<void> => {
    await apiClient.put('/rooms', { roomId: Number(id), status })
  },

  // Xóa phòng
  delete: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/rooms/${id}`)
  },
}

