// Types for Room
export interface Room {
  id: string
  roomId?: number
  hostelId?: number
  roomNumber: string
  floor: number
  area: number
  areaM2?: number
  price: number
  pricePerMonth?: number
  status: RoomStatus
  roomStatus?: RoomStatus
  description?: string
  depositAmount?: number
  maxOccupants?: number
  electricityPricePerKwh?: number
  waterPricePerM3?: number
  wifiFee?: number
  parkingFee?: number
  hasAirConditioner?: boolean
  hasWaterHeater?: boolean
  hasPrivateBathroom?: boolean
  hasKitchen?: boolean
  allowPet?: boolean
  pictures?: RoomPicture[]
  primaryPictureUrl?: string
  amenities?: string[] // Optional array for backward compatibility
  ownerId?: number
  ownerName?: string
  ownerEmail?: string
  ownerPhone?: string
  title?: string // Optional UI field
  address?: string // Optional UI field
  image?: string // Optional UI field
  rating?: number // Optional UI field
}

export interface RoomPicture {
  pictureId: number
  roomId: number
  pictureUrl: string
  pictureDescription?: string
  isPrimary: boolean
  displayOrder: number
  createdAt?: string
  updatedAt?: string
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
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
  ADMIN = 'ADMIN',
  HOSTELOWNER = 'HOSTELOWNER',
  GUEST = 'GUEST',
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
  isActive?: boolean
}

export interface Hostel {
  hostelId: number
  ownerId: number
  hostelName: string
  address: string
  ward?: string
  district?: string
  city?: string
  description?: string
  backgroundImg?: string
  totalFloors: number
  totalRooms: number
  createdAt?: string
  updatedAt?: string
}

