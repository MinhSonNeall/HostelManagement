import apiClient from './axios'
import type { Contract } from '../types'

// API functions cho Contracts
export const contractApi = {
  // Lấy danh sách tất cả hợp đồng
  getAll: async (): Promise<Contract[]> => {
    const response = await apiClient.get<Contract[]>('/contracts')
    return response.data
  },

  // Lấy thông tin một hợp đồng theo ID
  getById: async (id: string): Promise<Contract> => {
    const response = await apiClient.get<Contract>(`/contracts/${id}`)
    return response.data
  },

  // Tạo hợp đồng mới
  create: async (contract: Omit<Contract, 'id'>): Promise<Contract> => {
    const response = await apiClient.post<Contract>('/contracts', contract)
    return response.data
  },

  // Cập nhật thông tin hợp đồng
  update: async (id: string, contract: Partial<Contract>): Promise<Contract> => {
    const response = await apiClient.put<Contract>(`/contracts/${id}`, contract)
    return response.data
  },

  // Xóa hợp đồng
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/contracts/${id}`)
  },
}

