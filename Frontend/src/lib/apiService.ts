import apiClient from './apiClient';
import type {
  User,
  Role,
  Department,
  Asset,
  AssetStatus,
  AssetCategory,
  CustomField,
  AllocationRecord,
  Transfer,
  Resource,
  Booking,
  MaintenanceRequest,
  AuditCycle,
  AuditItem,
  Notification,
  ActivityLog,
  KPIData
} from '../types';

// ============================================================================
// Translations & Mappers
// ============================================================================

export function toFrontendRole(role: string): Role {
  switch (role) {
    case 'admin': return 'Admin';
    case 'asset_manager': return 'AssetManager';
    case 'department_head': return 'DeptHead';
    case 'employee': return 'Employee';
    case 'auditor': return 'Auditor';
    case 'technician': return 'Technician';
    default: return 'Employee';
  }
}

export function toBackendRole(role: Role): string {
  switch (role) {
    case 'Admin': return 'admin';
    case 'AssetManager': return 'asset_manager';
    case 'DeptHead': return 'department_head';
    case 'Employee': return 'employee';
    case 'Auditor': return 'auditor';
    case 'Technician': return 'technician';
  }
}

export function toFrontendAssetStatus(status: string): AssetStatus {
  switch (status) {
    case 'available': return 'Available';
    case 'allocated': return 'Allocated';
    case 'reserved': return 'Reserved';
    case 'under_maintenance': return 'UnderMaintenance';
    case 'lost': return 'Lost';
    case 'retired': return 'Retired';
    case 'disposed': return 'Disposed';
    default: return 'Available';
  }
}

export function toBackendAssetStatus(status: AssetStatus): string {
  switch (status) {
    case 'Available': return 'available';
    case 'Allocated': return 'allocated';
    case 'Reserved': return 'reserved';
    case 'UnderMaintenance': return 'under_maintenance';
    case 'Lost': return 'lost';
    case 'Retired': return 'retired';
    case 'Disposed': return 'disposed';
  }
}

// Maps backend Asset model to frontend Asset interface
export function mapAsset(a: any): Asset {
  return {
    id: a.id,
    tag: a.assetCode,
    name: a.name,
    category: a.category?.name || 'Uncategorized',
    categoryId: a.categoryId,
    status: toFrontendAssetStatus(a.status),
    condition: 'Good', // default condition (database stores condition logs inside allocations/returns)
    location: a.location ? `${a.location.building || ''} ${a.location.floor || ''} ${a.location.room || ''}`.trim() : 'Off-site',
    department: a.department?.name,
    assignedTo: a.allocations?.find((al: any) => al.status === 'active')?.employee?.firstName 
      ? `${a.allocations.find((al: any) => al.status === 'active').employee.firstName} ${a.allocations.find((al: any) => al.status === 'active').employee.lastName}`
      : undefined,
    assignedToId: a.allocations?.find((al: any) => al.status === 'active')?.employeeId,
    purchaseDate: a.purchaseDate,
    purchaseValue: a.purchaseCost ? Number(a.purchaseCost) : undefined,
    warrantyExpiry: a.warrantyExpiryDate,
    photoUrl: a.images?.find((img: any) => img.isPrimary)?.imageUrl || a.images?.[0]?.imageUrl,
    description: a.description || undefined,
    customFields: a.customFields || {},
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

// Maps backend Department to frontend Department
export function mapDepartment(d: any): Department {
  return {
    id: d.id,
    name: d.name,
    head: d.headEmployee ? `${d.headEmployee.firstName} ${d.headEmployee.lastName}` : undefined,
    parent: d.parentDepartment?.name,
    status: d.status === 'active' ? 'Active' : 'Inactive',
    employeeCount: d.employees?.length || 0,
  };
}

// Maps backend Category to frontend AssetCategory
export function mapCategory(c: any): AssetCategory {
  return {
    id: c.id,
    name: c.name,
    description: c.description || undefined,
    customFields: c.customFields?.map((f: any) => ({
      id: f.id,
      name: f.fieldName,
      type: f.fieldType,
      options: f.options || undefined,
      required: f.isRequired,
    })) || [],
    assetCount: c._count?.assets || c.assets?.length || 0,
  };
}

// Maps backend Allocation to frontend AllocationRecord
export function mapAllocation(a: any): AllocationRecord {
  // Overdue check
  const isOverdue = a.status === 'active' && a.expectedReturnDate && new Date(a.expectedReturnDate) < new Date();
  const frontendStatus = isOverdue ? 'Overdue' : a.status === 'active' ? 'Active' : 'Returned';

  return {
    id: a.id,
    assetId: a.assetId,
    assetTag: a.asset?.assetCode || '',
    assetName: a.asset?.name || '',
    holderId: a.employeeId,
    holderName: a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : '',
    holderDepartment: a.department?.name || '',
    allocatedDate: a.allocatedAt,
    expectedReturn: a.expectedReturnDate || undefined,
    actualReturn: a.actualReturnDate || undefined,
    status: frontendStatus,
    conditionOnReturn: undefined, // loaded separately or from returns table
    notes: a.notes || undefined,
  };
}

// Maps backend Transfer to frontend Transfer
export function mapTransfer(t: any): Transfer {
  let frontendStatus: any = 'Requested';
  if (t.status === 'approved') frontendStatus = 'Approved';
  if (t.status === 'completed') frontendStatus = 'Reallocated';

  return {
    id: t.id,
    assetId: t.assetId,
    assetTag: t.asset?.assetCode || '',
    assetName: t.asset?.name || '',
    fromUserId: t.fromEmployeeId,
    fromUserName: t.fromEmployee ? `${t.fromEmployee.firstName} ${t.fromEmployee.lastName}` : '',
    toUserId: t.toEmployeeId,
    toUserName: t.toEmployee ? `${t.toEmployee.firstName} ${t.toEmployee.lastName}` : '',
    requestedAt: t.requestedAt,
    status: frontendStatus,
    notes: t.reason || undefined,
  };
}

// Maps backend Resource to frontend Resource
export function mapResource(r: any): Resource {
  return {
    id: r.id,
    name: r.name,
    type: r.resourceType,
    location: r.location ? `${r.location.building || ''} ${r.location.floor || ''} ${r.location.room || ''}`.trim() : 'Site',
    capacity: r.capacity || undefined,
    description: r.description || undefined,
  };
}

// Maps backend Booking to frontend Booking
export function mapBooking(b: any): Booking {
  let frontendStatus: any = 'Upcoming';
  if (b.status === 'ongoing') frontendStatus = 'Ongoing';
  if (b.status === 'completed') frontendStatus = 'Completed';
  if (b.status === 'cancelled') frontendStatus = 'Cancelled';

  return {
    id: b.id,
    resourceId: b.resourceId,
    resourceName: b.resource?.name || '',
    bookedById: b.bookedBy,
    bookedByName: b.booker ? `${b.booker.firstName} ${b.booker.lastName}` : '',
    title: b.title,
    startTime: b.startTime,
    endTime: b.endTime,
    status: frontendStatus,
    notes: b.description || undefined,
  };
}

// Maps backend MaintenanceRequest to frontend MaintenanceRequest
export function mapMaintenance(m: any): MaintenanceRequest {
  let frontendStatus: any = 'Pending';
  if (m.status === 'approved') frontendStatus = 'Approved';
  if (m.status === 'technician_assigned') frontendStatus = 'Assigned';
  if (m.status === 'in_progress') frontendStatus = 'InProgress';
  if (m.status === 'resolved') frontendStatus = 'Resolved';
  if (m.status === 'rejected') frontendStatus = 'Rejected';

  let priority: any = 'Medium';
  if (m.priority === 'low') priority = 'Low';
  if (m.priority === 'high') priority = 'High';
  if (m.priority === 'critical') priority = 'Critical';

  const assignment = m.assignments?.find((a: any) => a.completedAt === null);

  return {
    id: m.id,
    assetId: m.assetId,
    assetTag: m.asset?.assetCode || '',
    assetName: m.asset?.name || '',
    requestedById: m.reportedBy,
    requestedByName: m.reporter ? `${m.reporter.firstName} ${m.reporter.lastName}` : '',
    priority,
    description: m.title + (m.description ? `: ${m.description}` : ''),
    photoUrl: m.attachments?.[0]?.fileUrl || undefined,
    status: frontendStatus,
    technicianId: assignment?.technicianId,
    technicianName: assignment?.technician ? `${assignment.technician.firstName} ${assignment.technician.lastName}` : undefined,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    resolvedAt: m.resolvedAt || undefined,
    notes: m.resolutionNotes || undefined,
  };
}

// Maps backend AuditCycle to frontend AuditCycle
export function mapAuditCycle(a: any): AuditCycle {
  let frontendStatus: any = 'Draft';
  if (a.status === 'in_progress') frontendStatus = 'Active';
  if (a.status === 'completed' || a.status === 'closed') frontendStatus = 'Completed';

  // Calculate verify counts
  const items = a.assignments?.flatMap((as: any) => as.items) || [];
  const verifiedCount = items.filter((i: any) => i.result === 'verified').length;
  const missingCount = items.filter((i: any) => i.result === 'missing').length;
  const damagedCount = items.filter((i: any) => i.result === 'damaged').length;

  return {
    id: a.id,
    name: a.name,
    scope: a.cycleCode,
    startDate: a.startDate,
    endDate: a.endDate,
    auditors: a.assignments?.map((as: any) => ({
      id: as.auditor.id,
      name: `${as.auditor.firstName} ${as.auditor.lastName}`,
      avatarUrl: as.auditor.avatarUrl || undefined,
    })) || [],
    status: frontendStatus,
    totalAssets: items.length,
    verifiedCount,
    missingCount,
    damagedCount,
  };
}

// Maps backend AuditItem to frontend AuditItem
export function mapAuditItem(i: any): AuditItem {
  let frontendStatus: any = 'Pending';
  if (i.result === 'verified') frontendStatus = 'Verified';
  if (i.result === 'missing') frontendStatus = 'Missing';
  if (i.result === 'damaged') frontendStatus = 'Damaged';

  return {
    id: i.id,
    cycleId: i.auditAssignment?.auditCycleId || '',
    assetId: i.assetId,
    assetTag: i.asset?.assetCode || '',
    assetName: i.asset?.name || '',
    category: i.asset?.category?.name || '',
    location: i.asset?.location ? `${i.asset.location.building || ''} ${i.asset.location.room || ''}`.trim() : '',
    status: frontendStatus,
    notes: i.conditionNotes || undefined,
  };
}

// Maps backend Notification to frontend Notification
export function mapNotification(n: any): Notification {
  let type: any = 'system';
  if (n.notificationType === 'action_required') type = 'transfer'; // maps dynamic types
  if (n.notificationType === 'warning') type = 'maintenance';

  return {
    id: n.id,
    type,
    title: n.title,
    message: n.message,
    read: n.isRead,
    createdAt: n.createdAt,
    link: n.referenceId ? `/assets` : undefined, // routing link helper
  };
}

// Maps backend ActivityLog to frontend ActivityLog
export function mapActivityLog(l: any): ActivityLog {
  return {
    id: l.id,
    timestamp: l.createdAt,
    userId: l.actorId || '',
    userName: l.actor ? `${l.actor.firstName} ${l.actor.lastName}` : 'System',
    action: l.action,
    entity: l.entityType,
    entityId: l.entityId,
    details: l.details ? JSON.stringify(l.details) : undefined,
  };
}

// ============================================================================
// API Endpoints Methods
// ============================================================================

export const apiService = {
  // --- Dashboard KPIs ---
  async getDashboardKPI(): Promise<KPIData> {
    const res = await apiClient.get('/assets'); // fetch asset list to derive metrics
    const assets = res.data.data.data || [];
    
    const available = assets.filter((a: any) => a.status === 'available').length;
    const allocated = assets.filter((a: any) => a.status === 'allocated').length;
    const maintenance = assets.filter((a: any) => a.status === 'under_maintenance').length;

    // Fetch active bookings
    const bookingsRes = await apiClient.get('/bookings');
    const bookingsCount = bookingsRes.data.data.data?.filter((b: any) => b.status === 'upcoming' || b.status === 'ongoing').length || 0;

    return {
      assetsAvailable: available,
      assetsAllocated: allocated,
      maintenanceToday: maintenance,
      activeBookings: bookingsCount,
      pendingTransfers: 0, // dynamic transfer placeholder count
      upcomingReturns: 0,
    };
  },

  // --- Assets CRUD ---
  async getAssets(params?: any): Promise<Asset[]> {
    const res = await apiClient.get('/assets', { params });
    const list = res.data.data.data || [];
    return list.map(mapAsset);
  },

  async getAssetById(id: string): Promise<Asset> {
    const res = await apiClient.get(`/assets/${id}`);
    return mapAsset(res.data.data);
  },

  async createAsset(data: any): Promise<Asset> {
    const payload = {
      name: data.name,
      categoryId: data.categoryId,
      locationId: data.locationId || undefined,
      purchaseCost: Number(data.purchaseValue) || undefined,
      purchaseDate: data.purchaseDate || undefined,
      warrantyExpiryDate: data.warrantyExpiry || undefined,
      serialNumber: data.serialNumber || undefined,
    };
    const res = await apiClient.post('/assets', payload);
    return mapAsset(res.data.data);
  },

  async updateAsset(id: string, data: any): Promise<Asset> {
    const res = await apiClient.put(`/assets/${id}`, data);
    return mapAsset(res.data.data);
  },

  async deleteAsset(id: string): Promise<void> {
    await apiClient.delete(`/assets/${id}`);
  },

  // --- Category CRUD ---
  async getCategories(): Promise<AssetCategory[]> {
    const res = await apiClient.get('/categories');
    const list = res.data.data || [];
    return list.map(mapCategory);
  },

  async createCategory(data: any): Promise<AssetCategory> {
    const res = await apiClient.post('/categories', data);
    return mapCategory(res.data.data);
  },

  // --- Organization Settings (Departments & Employees) ---
  async getDepartments(): Promise<Department[]> {
    const res = await apiClient.get('/departments');
    const list = res.data.data || [];
    return list.map(mapDepartment);
  },

  async createDepartment(data: any): Promise<Department> {
    const payload = {
      name: data.name,
      code: data.code || `DEP-${Date.now()}`,
      parentDepartmentId: data.parentDepartmentId || undefined,
      headEmployeeId: data.headEmployeeId || undefined,
    };
    const res = await apiClient.post('/departments', payload);
    return mapDepartment(res.data.data);
  },

  async getEmployees(): Promise<any[]> {
    const res = await apiClient.get('/employees');
    return res.data.data.data || [];
  },

  async createEmployee(data: any): Promise<any> {
    const res = await apiClient.post('/employees', data);
    return res.data.data;
  },

  async promoteUser(userId: string, roleName: string): Promise<void> {
    await apiClient.post('/auth/promote', { userId, roleName });
  },

  // --- Locations ---
  async getLocations(): Promise<any[]> {
    const res = await apiClient.get('/locations');
    return res.data.data.data || [];
  },

  async createLocation(data: any): Promise<any> {
    const res = await apiClient.post('/locations', data);
    return res.data.data;
  },

  // --- Allocations, Returns & Transfers ---
  async getAllocations(params?: any): Promise<AllocationRecord[]> {
    const res = await apiClient.get('/allocations', { params });
    const list = res.data.data.data || [];
    return list.map(mapAllocation);
  },

  async allocateAsset(data: any): Promise<AllocationRecord> {
    const res = await apiClient.post('/allocations', data);
    return mapAllocation(res.data.data);
  },

  async returnAsset(data: any): Promise<void> {
    const payload = {
      allocationId: data.allocationId,
      returnCondition: data.returnCondition.toLowerCase(),
      conditionNotes: data.conditionNotes,
    };
    await apiClient.post('/allocations/returns', payload);
  },

  async getTransfers(): Promise<Transfer[]> {
    // Backend stores transfers under allocations/transfers
    const res = await apiClient.get('/allocations/transfers');
    const list = res.data.data || [];
    return list.map(mapTransfer);
  },

  async createTransfer(data: any): Promise<Transfer> {
    const res = await apiClient.post('/allocations/transfers', data);
    return mapTransfer(res.data.data);
  },

  async handleTransfer(id: string, action: 'approve' | 'reject'): Promise<void> {
    await apiClient.post(`/allocations/transfers/${id}/action`, { action });
  },

  // --- Resource Bookings ---
  async getResources(): Promise<Resource[]> {
    const res = await apiClient.get('/bookings/resources');
    const list = res.data.data || [];
    return list.map(mapResource);
  },

  async createResource(data: any): Promise<Resource> {
    const res = await apiClient.post('/bookings/resources', data);
    return mapResource(res.data.data);
  },

  async getBookings(): Promise<Booking[]> {
    const res = await apiClient.get('/bookings');
    const list = res.data.data.data || [];
    return list.map(mapBooking);
  },

  async createBooking(data: any): Promise<Booking> {
    const res = await apiClient.post('/bookings', data);
    return mapBooking(res.data.data);
  },

  async cancelBooking(id: string, reason: string): Promise<void> {
    await apiClient.post(`/bookings/${id}/cancel`, { cancelledReason: reason });
  },

  // --- Maintenance Tickets ---
  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    const res = await apiClient.get('/maintenance');
    const list = res.data.data.data || [];
    return list.map(mapMaintenance);
  },

  async raiseMaintenance(data: any): Promise<MaintenanceRequest> {
    const payload = {
      assetId: data.assetId,
      maintenanceType: data.type?.toLowerCase() || 'corrective',
      priority: data.priority?.toLowerCase() || 'medium',
      title: data.description?.substring(0, 100) || 'Maintenance Request',
      description: data.description,
    };
    const res = await apiClient.post('/maintenance', payload);
    return mapMaintenance(res.data.data);
  },

  async approveMaintenance(id: string, action: 'approved' | 'rejected', comments?: string): Promise<void> {
    await apiClient.post(`/maintenance/${id}/approve`, { action, comments });
  },

  async assignMaintenance(id: string, technicianId: string, notes?: string): Promise<void> {
    await apiClient.post(`/maintenance/${id}/assign`, { technicianId, notes });
  },

  async startMaintenance(id: string): Promise<void> {
    await apiClient.post(`/maintenance/${id}/start`);
  },

  async resolveMaintenance(id: string, resolutionNotes: string, actualCost?: number): Promise<void> {
    await apiClient.post(`/maintenance/${id}/resolve`, { resolutionNotes, actualCost });
  },

  async closeMaintenance(id: string): Promise<void> {
    await apiClient.post(`/maintenance/${id}/close`);
  },

  // --- Audits Cycles & Item Verifications ---
  async getAuditCycles(): Promise<AuditCycle[]> {
    const res = await apiClient.get('/audits/cycles');
    const list = res.data.data || [];
    return list.map(mapAuditCycle);
  },

  async createAuditCycle(data: any): Promise<AuditCycle> {
    const res = await apiClient.post('/audits/cycles', data);
    return mapAuditCycle(res.data.data);
  },

  async lockAuditCycle(id: string): Promise<void> {
    await apiClient.post(`/audits/cycles/${id}/lock`);
  },

  async getAuditAssignment(id: string): Promise<any> {
    const res = await apiClient.get(`/audits/assignments/${id}`);
    const assignment = res.data.data;
    return {
      id: assignment.id,
      cycleId: assignment.auditCycleId,
      items: assignment.items?.map(mapAuditItem) || [],
    };
  },

  async verifyAuditItem(assignmentId: string, itemId: string, data: any): Promise<AuditItem> {
    const payload = {
      result: data.status.toLowerCase(), // maps 'Verified'/'Missing'/'Damaged' -> 'verified'/'missing'/'damaged'
      conditionNotes: data.notes,
      locationVerified: true, // defaults verification
    };
    const res = await apiClient.post(`/audits/assignments/${assignmentId}/verify/${itemId}`, payload);
    return mapAuditItem(res.data.data);
  },

  // --- Notifications Recipient feeds ---
  async getNotifications(): Promise<Notification[]> {
    const res = await apiClient.get('/notifications');
    const list = res.data.data.data || [];
    return list.map(mapNotification);
  },

  async markNotificationRead(id: string): Promise<void> {
    await apiClient.post(`/notifications/${id}/read`);
  },

  async markAllNotificationsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all');
  },

  // --- Activity Logs Audit trail ---
  async getActivityLogs(): Promise<ActivityLog[]> {
    const res = await apiClient.get('/activity-logs');
    const list = res.data.data.data || [];
    return list.map(mapActivityLog);
  },

  // --- File Upload Helper ---
  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/maintenance/attachments', formData, { // default endpoint hosting uploads
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data.fileUrl; // returns public hosted url path
  },
};

export default apiService;
