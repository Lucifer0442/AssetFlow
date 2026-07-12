// Core domain types mirroring backend models

export type Role = 'Admin' | 'AssetManager' | 'DeptHead' | 'Employee'

export type AssetStatus =
  | 'Available'
  | 'Allocated'
  | 'Reserved'
  | 'UnderMaintenance'
  | 'Lost'
  | 'Retired'
  | 'Disposed'

export type AssetCondition = 'Good' | 'Fair' | 'Poor' | 'Damaged'
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low'
export type MaintenanceStatus = 'Pending' | 'Approved' | 'Assigned' | 'InProgress' | 'Resolved' | 'Rejected'
export type BookingStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled'
export type TransferStatus = 'Requested' | 'Approved' | 'Reallocated'
export type AuditStatus = 'Active' | 'Completed' | 'Draft'
export type CheckStatus = 'Pending' | 'Verified' | 'Missing' | 'Damaged'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  department?: string
  avatarUrl?: string
}

export interface Department {
  id: string
  name: string
  head?: string
  parent?: string
  status: 'Active' | 'Inactive'
  employeeCount: number
}

export interface AssetCategory {
  id: string
  name: string
  description?: string
  customFields?: CustomField[]
  assetCount: number
}

export interface CustomField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select'
  options?: string[]
  required: boolean
}

export interface Asset {
  id: string
  tag: string
  name: string
  category: string
  categoryId: string
  status: AssetStatus
  condition: AssetCondition
  location: string
  department?: string
  assignedTo?: string
  assignedToId?: string
  purchaseDate?: string
  purchaseValue?: number
  warrantyExpiry?: string
  photoUrl?: string
  description?: string
  customFields?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface AllocationRecord {
  id: string
  assetId: string
  assetTag: string
  assetName: string
  holderId: string
  holderName: string
  holderDepartment: string
  allocatedDate: string
  expectedReturn?: string
  actualReturn?: string
  status: 'Active' | 'Returned' | 'Overdue'
  conditionOnReturn?: AssetCondition
  notes?: string
}

export interface Transfer {
  id: string
  assetId: string
  assetTag: string
  assetName: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserName: string
  requestedAt: string
  status: TransferStatus
  notes?: string
}

export interface Resource {
  id: string
  name: string
  type: string
  location: string
  capacity?: number
  description?: string
}

export interface Booking {
  id: string
  resourceId: string
  resourceName: string
  bookedById: string
  bookedByName: string
  department?: string
  title: string
  startTime: string
  endTime: string
  status: BookingStatus
  notes?: string
}

export interface MaintenanceRequest {
  id: string
  assetId: string
  assetTag: string
  assetName: string
  requestedById: string
  requestedByName: string
  priority: Priority
  description: string
  photoUrl?: string
  status: MaintenanceStatus
  technicianId?: string
  technicianName?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  notes?: string
}

export interface AuditCycle {
  id: string
  name: string
  scope: string
  startDate: string
  endDate: string
  auditors: { id: string; name: string; avatarUrl?: string }[]
  status: AuditStatus
  totalAssets: number
  verifiedCount: number
  missingCount: number
  damagedCount: number
}

export interface AuditItem {
  id: string
  cycleId: string
  assetId: string
  assetTag: string
  assetName: string
  category: string
  location: string
  status: CheckStatus
  notes?: string
}

export interface Notification {
  id: string
  type: 'allocation' | 'maintenance' | 'booking' | 'transfer' | 'audit' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

export interface ActivityLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: string
  entity: string
  entityId: string
  details?: string
}

export interface KPIData {
  assetsAvailable: number
  assetsAllocated: number
  maintenanceToday: number
  activeBookings: number
  pendingTransfers: number
  upcomingReturns: number
}
