import apiClient from './axios'
import type { Tenant } from '../types'

// API functions cho Tenants
export const tenantApi = {
  // Lấy danh sách tất cả khách thuê
  getAll: async (): Promise<Tenant[]> => {
    const response = await apiClient.get<Tenant[]>('/tenants')
    return response.data
  },

  // Lấy thông tin một khách thuê theo ID
  getById: async (id: string): Promise<Tenant> => {
    const response = await apiClient.get<Tenant>(`/tenants/${id}`)
    return response.data
  },

  // Tạo khách thuê mới
  create: async (tenant: Omit<Tenant, 'id'>): Promise<Tenant> => {
    const response = await apiClient.post<Tenant>('/tenants', tenant)
    return response.data
  },

  // Cập nhật thông tin khách thuê
  update: async (id: string, tenant: Partial<Tenant>): Promise<Tenant> => {
    const response = await apiClient.put<Tenant>(`/tenants/${id}`, tenant)
    return response.data
  },

  // Xóa khách thuê
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tenants/${id}`)
  },
}

