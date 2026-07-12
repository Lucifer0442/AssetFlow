import { MaintenanceType, MaintenanceStatus, ApprovalAction } from '@prisma/client';

export interface CreateMaintenanceInput {
  assetId: string;
  maintenanceType: MaintenanceType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  estimatedCost?: number;
}

export interface ApproveMaintenanceInput {
  action: ApprovalAction;
  comments?: string;
}

export interface AssignTechnicianInput {
  technicianId: string;
  notes?: string;
}

export interface ResolveMaintenanceInput {
  resolutionNotes: string;
  actualCost?: number;
}
