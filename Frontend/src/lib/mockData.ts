import type { Asset, AllocationRecord, MaintenanceRequest, Booking, AuditCycle, KPIData, Department, AssetCategory, User, Resource, Transfer, Notification, ActivityLog, AuditItem } from '@/types'

// ─── KPI ────────────────────────────────────────────────────────────────────
export const mockKPI: KPIData = {
  assetsAvailable: 12482,
  assetsAllocated: 8105,
  maintenanceToday: 47,
  activeBookings: 156,
  pendingTransfers: 23,
  upcomingReturns: 89,
}

// ─── Departments ─────────────────────────────────────────────────────────────
export const mockDepartments: Department[] = [
  { id: 'd1', name: 'Engineering', head: 'Aryan Sharma', parent: undefined, status: 'Active', employeeCount: 142 },
  { id: 'd2', name: 'Design', head: 'Priya Mehta', parent: undefined, status: 'Active', employeeCount: 38 },
  { id: 'd3', name: 'Operations', head: 'Vikram Nair', parent: undefined, status: 'Active', employeeCount: 65 },
  { id: 'd4', name: 'Finance', head: 'Sunita Rao', parent: undefined, status: 'Active', employeeCount: 29 },
  { id: 'd5', name: 'HR', head: 'Deepak Joshi', parent: undefined, status: 'Active', employeeCount: 18 },
  { id: 'd6', name: 'Frontend', head: 'Kavya Singh', parent: 'Engineering', status: 'Active', employeeCount: 22 },
]

// ─── Categories ───────────────────────────────────────────────────────────────
export const mockCategories: AssetCategory[] = [
  { id: 'c1', name: 'Laptops', description: 'Portable computing devices', assetCount: 1240 },
  { id: 'c2', name: 'Monitors', description: 'Display equipment', assetCount: 980 },
  { id: 'c3', name: 'Furniture', description: 'Office furniture', assetCount: 3200 },
  { id: 'c4', name: 'Vehicles', description: 'Company vehicles', assetCount: 42 },
  { id: 'c5', name: 'Conference Room Equipment', description: 'Projectors, whiteboards, etc.', assetCount: 87 },
  { id: 'c6', name: 'Mobile Devices', description: 'Phones and tablets', assetCount: 563 },
]

// ─── Users / Employees ────────────────────────────────────────────────────────
export const mockUsers: User[] = [
  { id: 'u1', name: 'Aryan Sharma', email: 'aryan@assetflow.in', role: 'Admin', department: 'Engineering' },
  { id: 'u2', name: 'Priya Mehta', email: 'priya@assetflow.in', role: 'AssetManager', department: 'Design' },
  { id: 'u3', name: 'Vikram Nair', email: 'vikram@assetflow.in', role: 'DeptHead', department: 'Operations' },
  { id: 'u4', name: 'Sunita Rao', email: 'sunita@assetflow.in', role: 'Employee', department: 'Finance' },
  { id: 'u5', name: 'Deepak Joshi', email: 'deepak@assetflow.in', role: 'Employee', department: 'HR' },
  { id: 'u6', name: 'Kavya Singh', email: 'kavya@assetflow.in', role: 'Employee', department: 'Engineering' },
  { id: 'u7', name: 'Rohan Gupta', email: 'rohan@assetflow.in', role: 'Employee', department: 'Engineering' },
  { id: 'u8', name: 'Sneha Patel', email: 'sneha@assetflow.in', role: 'DeptHead', department: 'Design' },
]

// ─── Assets ──────────────────────────────────────────────────────────────────
export const mockAssets: Asset[] = [
  { id: 'a1', tag: 'AF-0001', name: 'MacBook Pro 14"', category: 'Laptops', categoryId: 'c1', status: 'Allocated', condition: 'Good', location: 'Floor 2', department: 'Engineering', assignedTo: 'Aryan Sharma', assignedToId: 'u1', purchaseDate: '2023-01-15', purchaseValue: 185000, warrantyExpiry: '2026-01-15', createdAt: '2023-01-15', updatedAt: '2024-06-01' },
  { id: 'a2', tag: 'AF-0002', name: 'Dell UltraSharp 27"', category: 'Monitors', categoryId: 'c2', status: 'Available', condition: 'Good', location: 'IT Store', purchaseDate: '2023-03-10', purchaseValue: 42000, warrantyExpiry: '2026-03-10', createdAt: '2023-03-10', updatedAt: '2024-05-20' },
  { id: 'a3', tag: 'AF-0003', name: 'Standing Desk', category: 'Furniture', categoryId: 'c3', status: 'Allocated', condition: 'Good', location: 'Floor 3', department: 'Design', assignedTo: 'Priya Mehta', assignedToId: 'u2', purchaseDate: '2022-08-01', purchaseValue: 25000, createdAt: '2022-08-01', updatedAt: '2024-04-15' },
  { id: 'a4', tag: 'AF-0004', name: 'iPhone 15 Pro', category: 'Mobile Devices', categoryId: 'c6', status: 'UnderMaintenance', condition: 'Fair', location: 'Service Center', purchaseDate: '2023-09-20', purchaseValue: 134900, warrantyExpiry: '2024-09-20', createdAt: '2023-09-20', updatedAt: '2024-07-01' },
  { id: 'a5', tag: 'AF-0005', name: 'Toyota Innova', category: 'Vehicles', categoryId: 'c4', status: 'Reserved', condition: 'Good', location: 'Parking B', purchaseDate: '2021-05-15', purchaseValue: 2100000, warrantyExpiry: '2024-05-15', createdAt: '2021-05-15', updatedAt: '2024-07-10' },
  { id: 'a6', tag: 'AF-0006', name: 'Epson Projector', category: 'Conference Room Equipment', categoryId: 'c5', status: 'Available', condition: 'Good', location: 'Conference Room A', purchaseDate: '2022-11-05', purchaseValue: 65000, warrantyExpiry: '2025-11-05', createdAt: '2022-11-05', updatedAt: '2024-06-20' },
  { id: 'a7', tag: 'AF-0007', name: 'HP Laptop 15s', category: 'Laptops', categoryId: 'c1', status: 'Available', condition: 'Good', location: 'IT Store', purchaseDate: '2024-01-10', purchaseValue: 65000, warrantyExpiry: '2027-01-10', createdAt: '2024-01-10', updatedAt: '2024-01-10' },
  { id: 'a8', tag: 'AF-0008', name: 'Ergonomic Chair', category: 'Furniture', categoryId: 'c3', status: 'Allocated', condition: 'Good', location: 'Floor 1', department: 'Finance', assignedTo: 'Sunita Rao', assignedToId: 'u4', purchaseDate: '2023-06-01', purchaseValue: 18000, createdAt: '2023-06-01', updatedAt: '2024-03-15' },
  { id: 'a9', tag: 'AF-0009', name: 'iPad Pro 12.9"', category: 'Mobile Devices', categoryId: 'c6', status: 'Lost', condition: 'Poor', location: 'Unknown', purchaseDate: '2022-12-01', purchaseValue: 112900, createdAt: '2022-12-01', updatedAt: '2024-05-01' },
  { id: 'a10', tag: 'AF-0010', name: 'Conference Table', category: 'Furniture', categoryId: 'c3', status: 'Retired', condition: 'Poor', location: 'Storage', purchaseDate: '2018-03-01', purchaseValue: 85000, createdAt: '2018-03-01', updatedAt: '2024-07-01' },
  { id: 'a11', tag: 'AF-0011', name: 'Lenovo ThinkPad X1', category: 'Laptops', categoryId: 'c1', status: 'Allocated', condition: 'Good', location: 'Floor 2', department: 'Engineering', assignedTo: 'Rohan Gupta', assignedToId: 'u7', purchaseDate: '2024-02-01', purchaseValue: 145000, warrantyExpiry: '2027-02-01', createdAt: '2024-02-01', updatedAt: '2024-02-01' },
  { id: 'a12', tag: 'AF-0012', name: 'Samsung 32" Monitor', category: 'Monitors', categoryId: 'c2', status: 'Available', condition: 'Good', location: 'IT Store', purchaseDate: '2024-03-15', purchaseValue: 38000, warrantyExpiry: '2027-03-15', createdAt: '2024-03-15', updatedAt: '2024-03-15' },
]

// ─── Allocations ──────────────────────────────────────────────────────────────
export const mockAllocations: AllocationRecord[] = [
  { id: 'al1', assetId: 'a1', assetTag: 'AF-0001', assetName: 'MacBook Pro 14"', holderId: 'u1', holderName: 'Aryan Sharma', holderDepartment: 'Engineering', allocatedDate: '2024-01-15', expectedReturn: '2025-01-15', status: 'Active' },
  { id: 'al2', assetId: 'a3', assetTag: 'AF-0003', assetName: 'Standing Desk', holderId: 'u2', holderName: 'Priya Mehta', holderDepartment: 'Design', allocatedDate: '2023-08-01', status: 'Active' },
  { id: 'al3', assetId: 'a8', assetTag: 'AF-0008', assetName: 'Ergonomic Chair', holderId: 'u4', holderName: 'Sunita Rao', holderDepartment: 'Finance', allocatedDate: '2023-06-15', status: 'Active' },
  { id: 'al4', assetId: 'a11', assetTag: 'AF-0011', assetName: 'Lenovo ThinkPad X1', holderId: 'u7', holderName: 'Rohan Gupta', holderDepartment: 'Engineering', allocatedDate: '2024-02-01', expectedReturn: '2024-06-01', status: 'Overdue' },
  { id: 'al5', assetId: 'a2', assetTag: 'AF-0002', assetName: 'Dell UltraSharp 27"', holderId: 'u6', holderName: 'Kavya Singh', holderDepartment: 'Engineering', allocatedDate: '2023-12-01', expectedReturn: '2024-12-01', status: 'Active' },
]

// ─── Transfers ────────────────────────────────────────────────────────────────
export const mockTransfers: Transfer[] = [
  { id: 'tr1', assetId: 'a7', assetTag: 'AF-0007', assetName: 'HP Laptop 15s', fromUserId: 'u5', fromUserName: 'Deepak Joshi', toUserId: 'u6', toUserName: 'Kavya Singh', requestedAt: '2024-07-10', status: 'Requested', notes: 'Need for new project' },
  { id: 'tr2', assetId: 'a6', assetTag: 'AF-0006', assetName: 'Epson Projector', fromUserId: 'u3', fromUserName: 'Vikram Nair', toUserId: 'u8', toUserName: 'Sneha Patel', requestedAt: '2024-07-08', status: 'Approved' },
]

// ─── Resources ────────────────────────────────────────────────────────────────
export const mockResources: Resource[] = [
  { id: 'r1', name: 'Conference Room A', type: 'Meeting Room', location: 'Floor 3', capacity: 12 },
  { id: 'r2', name: 'Conference Room B', type: 'Meeting Room', location: 'Floor 2', capacity: 8 },
  { id: 'r3', name: 'Training Hall', type: 'Training Room', location: 'Floor 1', capacity: 50 },
  { id: 'r4', name: 'Toyota Innova - MH01AB1234', type: 'Vehicle', location: 'Parking B' },
  { id: 'r5', name: 'Projector Kit 1', type: 'Equipment', location: 'IT Store' },
  { id: 'r6', name: 'Video Studio', type: 'Studio', location: 'Floor 4', capacity: 6 },
]

// ─── Bookings ─────────────────────────────────────────────────────────────────
const now = new Date()
export const mockBookings: Booking[] = [
  { id: 'b1', resourceId: 'r1', resourceName: 'Conference Room A', bookedById: 'u1', bookedByName: 'Aryan Sharma', title: 'Q3 Planning', startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0).toISOString(), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 30).toISOString(), status: 'Upcoming', department: 'Engineering' },
  { id: 'b2', resourceId: 'r2', resourceName: 'Conference Room B', bookedById: 'u2', bookedByName: 'Priya Mehta', title: 'Design Review', startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0).toISOString(), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0).toISOString(), status: 'Upcoming' },
  { id: 'b3', resourceId: 'r3', resourceName: 'Training Hall', bookedById: 'u3', bookedByName: 'Vikram Nair', title: 'Onboarding Session', startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0).toISOString(), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 13, 0).toISOString(), status: 'Upcoming' },
  { id: 'b4', resourceId: 'r1', resourceName: 'Conference Room A', bookedById: 'u4', bookedByName: 'Sunita Rao', title: 'Budget Review', startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 11, 0).toISOString(), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12, 0).toISOString(), status: 'Completed' },
  { id: 'b5', resourceId: 'r4', resourceName: 'Toyota Innova - MH01AB1234', bookedById: 'u5', bookedByName: 'Deepak Joshi', title: 'Airport Transfer', startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 8, 0).toISOString(), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 10, 0).toISOString(), status: 'Upcoming' },
]

// ─── Maintenance ──────────────────────────────────────────────────────────────
export const mockMaintenance: MaintenanceRequest[] = [
  { id: 'm1', assetId: 'a4', assetTag: 'AF-0004', assetName: 'iPhone 15 Pro', requestedById: 'u6', requestedByName: 'Kavya Singh', priority: 'High', description: 'Screen flickering and battery draining rapidly. Needs immediate attention.', status: 'InProgress', technicianId: 'u3', technicianName: 'Vikram Nair', createdAt: '2024-07-01', updatedAt: '2024-07-05' },
  { id: 'm2', assetId: 'a1', assetTag: 'AF-0001', assetName: 'MacBook Pro 14"', requestedById: 'u1', requestedByName: 'Aryan Sharma', priority: 'Medium', description: 'Keyboard keys are sticky. Need cleaning or replacement.', status: 'Pending', createdAt: '2024-07-10', updatedAt: '2024-07-10' },
  { id: 'm3', assetId: 'a6', assetTag: 'AF-0006', assetName: 'Epson Projector', requestedById: 'u8', requestedByName: 'Sneha Patel', priority: 'Low', description: 'Lamp needs replacement. Brightness reduced significantly.', status: 'Approved', createdAt: '2024-07-08', updatedAt: '2024-07-09' },
  { id: 'm4', assetId: 'a11', assetTag: 'AF-0011', assetName: 'Lenovo ThinkPad X1', requestedById: 'u7', requestedByName: 'Rohan Gupta', priority: 'Critical', description: 'Not booting at all. Possible hard drive failure.', status: 'Assigned', technicianId: 'u5', technicianName: 'Deepak Joshi', createdAt: '2024-07-11', updatedAt: '2024-07-11' },
  { id: 'm5', assetId: 'a8', assetTag: 'AF-0008', assetName: 'Ergonomic Chair', requestedById: 'u4', requestedByName: 'Sunita Rao', priority: 'Low', description: 'Height adjustment mechanism broken.', status: 'Resolved', createdAt: '2024-06-20', updatedAt: '2024-07-02', resolvedAt: '2024-07-02' },
  { id: 'm6', assetId: 'a2', assetTag: 'AF-0002', assetName: 'Dell UltraSharp 27"', requestedById: 'u6', requestedByName: 'Kavya Singh', priority: 'High', description: 'Dead pixels in center of screen.', status: 'Rejected', createdAt: '2024-07-05', updatedAt: '2024-07-06', notes: 'Under warranty, contact Dell support directly.' },
]

// ─── Audits ───────────────────────────────────────────────────────────────────
export const mockAuditCycles: AuditCycle[] = [
  { id: 'ac1', name: 'Q2 2024 Audit', scope: 'All IT Equipment', startDate: '2024-06-01', endDate: '2024-06-30', auditors: [{ id: 'u1', name: 'Aryan Sharma' }, { id: 'u2', name: 'Priya Mehta' }], status: 'Completed', totalAssets: 240, verifiedCount: 235, missingCount: 3, damagedCount: 2 },
  { id: 'ac2', name: 'Q3 2024 Audit', scope: 'Engineering Department', startDate: '2024-07-01', endDate: '2024-07-31', auditors: [{ id: 'u2', name: 'Priya Mehta' }, { id: 'u3', name: 'Vikram Nair' }], status: 'Active', totalAssets: 142, verifiedCount: 78, missingCount: 1, damagedCount: 0 },
  { id: 'ac3', name: 'Furniture Audit 2024', scope: 'All Furniture', startDate: '2024-08-01', endDate: '2024-08-15', auditors: [{ id: 'u5', name: 'Deepak Joshi' }], status: 'Draft', totalAssets: 450, verifiedCount: 0, missingCount: 0, damagedCount: 0 },
]

export const mockAuditItems: AuditItem[] = [
  { id: 'ai1', cycleId: 'ac2', assetId: 'a1', assetTag: 'AF-0001', assetName: 'MacBook Pro 14"', category: 'Laptops', location: 'Floor 2', status: 'Verified' },
  { id: 'ai2', cycleId: 'ac2', assetId: 'a7', assetTag: 'AF-0007', assetName: 'HP Laptop 15s', category: 'Laptops', location: 'IT Store', status: 'Verified' },
  { id: 'ai3', cycleId: 'ac2', assetId: 'a9', assetTag: 'AF-0009', assetName: 'iPad Pro 12.9"', category: 'Mobile Devices', location: 'Unknown', status: 'Missing' },
  { id: 'ai4', cycleId: 'ac2', assetId: 'a4', assetTag: 'AF-0004', assetName: 'iPhone 15 Pro', category: 'Mobile Devices', location: 'Service Center', status: 'Pending' },
  { id: 'ai5', cycleId: 'ac2', assetId: 'a11', assetTag: 'AF-0011', assetName: 'Lenovo ThinkPad X1', category: 'Laptops', location: 'Floor 2', status: 'Verified' },
  { id: 'ai6', cycleId: 'ac2', assetId: 'a6', assetTag: 'AF-0006', assetName: 'Epson Projector', category: 'Conference Room Equipment', location: 'Conference Room A', status: 'Damaged', notes: 'Lamp cracked' },
]

// ─── Notifications ────────────────────────────────────────────────────────────
export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'allocation', title: 'Asset Overdue', message: 'Lenovo ThinkPad X1 (AF-0011) is overdue for return by Rohan Gupta.', read: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'n2', type: 'maintenance', title: 'Maintenance Resolved', message: 'Ergonomic Chair (AF-0008) maintenance request has been resolved.', read: false, createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'n3', type: 'transfer', title: 'Transfer Requested', message: 'HP Laptop 15s (AF-0007) transfer requested from Deepak Joshi to Kavya Singh.', read: false, createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 'n4', type: 'booking', title: 'Booking Reminder', message: 'Your booking for Conference Room A starts in 30 minutes.', read: true, createdAt: new Date(Date.now() - 48 * 3600000).toISOString() },
  { id: 'n5', type: 'audit', title: 'Audit Cycle Active', message: 'Q3 2024 Audit cycle has been initiated. Please verify your assigned assets.', read: true, createdAt: new Date(Date.now() - 72 * 3600000).toISOString() },
  { id: 'n6', type: 'system', title: 'System Maintenance', message: 'AssetFlow will be down for maintenance on Sunday 2am–4am IST.', read: true, createdAt: new Date(Date.now() - 96 * 3600000).toISOString() },
]

// ─── Activity Logs ────────────────────────────────────────────────────────────
export const mockActivityLogs: ActivityLog[] = [
  { id: 'log1', timestamp: new Date(Date.now() - 10 * 60000).toISOString(), userId: 'u1', userName: 'Aryan Sharma', action: 'ALLOCATED', entity: 'Asset', entityId: 'AF-0001', details: 'Allocated MacBook Pro to Aryan Sharma' },
  { id: 'log2', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), userId: 'u2', userName: 'Priya Mehta', action: 'CREATED', entity: 'Booking', entityId: 'b2', details: 'Booked Conference Room B for Design Review' },
  { id: 'log3', timestamp: new Date(Date.now() - 90 * 60000).toISOString(), userId: 'u3', userName: 'Vikram Nair', action: 'APPROVED', entity: 'Maintenance', entityId: 'm3', details: 'Approved maintenance request for Epson Projector' },
  { id: 'log4', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), userId: 'u4', userName: 'Sunita Rao', action: 'RETURNED', entity: 'Asset', entityId: 'AF-0008', details: 'Returned Dell Monitor' },
  { id: 'log5', timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), userId: 'u1', userName: 'Aryan Sharma', action: 'REGISTERED', entity: 'Asset', entityId: 'AF-0012', details: 'Registered Samsung 32" Monitor' },
  { id: 'log6', timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), userId: 'u5', userName: 'Deepak Joshi', action: 'REQUESTED', entity: 'Transfer', entityId: 'tr1', details: 'Requested transfer of HP Laptop 15s' },
  { id: 'log7', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), userId: 'u2', userName: 'Priya Mehta', action: 'CREATED', entity: 'Audit', entityId: 'ac2', details: 'Created Q3 2024 Audit cycle' },
]
