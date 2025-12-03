import apiClient from './axios'
import type { Hostel } from '../types'

export interface CreateHostelPayload {
  hostelName: string
  address: string
  ward?: string
  district?: string
  city?: string
  description?: string
  backgroundImg?: string
  totalFloors?: number
  totalRooms?: number
}

export interface UpdateHostelPayload extends CreateHostelPayload {
  hostelId: number
  ownerId?: number
}

const normalizeHostel = (data: any): Hostel => ({
  hostelId: data.hostelId ?? data.id,
  ownerId: data.ownerId,
  hostelName: data.hostelName ?? data.name ?? '',
  address: data.address ?? '',
  ward: data.ward ?? '',
  district: data.district ?? '',
  city: data.city ?? '',
  description: data.description ?? '',
  backgroundImg: data.backgroundImg ?? data.backgroundimg ?? '',
  totalFloors: data.totalFloors ?? 1,
  totalRooms: data.totalRooms ?? 0,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
})

export const hostelApi = {
  getById: async (hostelId: number): Promise<Hostel> => {
    const response = await apiClient.get(`/hostels/${hostelId}`)
    return normalizeHostel(response.data)
  },

  getByOwner: async (ownerId: number): Promise<Hostel[]> => {
    const response = await apiClient.get('/hostels', { params: { ownerId } })
    const data = Array.isArray(response.data) ? response.data : []
    return data.map(normalizeHostel)
  },

  create: async (ownerId: number, payload: CreateHostelPayload): Promise<Hostel> => {
    const response = await apiClient.post('/hostels', {
      ownerId,
      hostelName: payload.hostelName,
      address: payload.address,
      ward: payload.ward,
      district: payload.district,
      city: payload.city,
      description: payload.description,
      backgroundImg: payload.backgroundImg,
      totalFloors: payload.totalFloors ?? 1,
      totalRooms: payload.totalRooms ?? 0,
    })
    return normalizeHostel(response.data)
  },

  update: async (hostelId: number, payload: UpdateHostelPayload): Promise<Hostel> => {
    const response = await apiClient.put(`/hostels/${hostelId}`, {
      ownerId: payload.ownerId,
      hostelName: payload.hostelName,
      address: payload.address,
      ward: payload.ward,
      district: payload.district,
      city: payload.city,
      description: payload.description,
      backgroundImg: payload.backgroundImg,
      totalFloors: payload.totalFloors ?? 1,
      totalRooms: payload.totalRooms ?? 0,
    })
    return normalizeHostel(response.data)
  },

  remove: async (hostelId: number): Promise<void> => {
    await apiClient.delete(`/hostels/${hostelId}`)
  },
}

