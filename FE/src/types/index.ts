// Types for Room
export interface Room {
  id: string
  roomNumber: string
  floor: number
  area: number
  price: number
  status: RoomStatus
  description?: string
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE'
}

// Types for Tenant
export interface Tenant {
  id: string
  fullName: string
  phoneNumber: string
  email?: string
  idCard: string
  roomId?: string
  startDate?: string
  endDate?: string
}

// Types for Contract
export interface Contract {
  id: string
  tenantId: string
  roomId: string
  startDate: string
  endDate: string
  monthlyRent: number
  deposit: number
  status: ContractStatus
}

export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED'
}

// User Role
export enum UserRole {
  HOSTEL_OWNER = 'HOSTEL_OWNER',
  CUSTOMER = 'CUSTOMER'
}

// User
export interface User {
  id: string
  username: string
  email?: string
  role: UserRole
  fullName?: string
  balance?: number
}

