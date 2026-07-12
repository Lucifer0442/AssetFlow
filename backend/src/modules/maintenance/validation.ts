import { z } from 'zod';
import { MaintenanceType, ApprovalAction } from '@prisma/client';

export const createMaintenanceSchema = z.object({
  assetId: z.string().uuid('Invalid Asset ID'),
  maintenanceType: z.nativeEnum(MaintenanceType),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  estimatedCost: z.number().nonnegative('Cost cannot be negative').optional(),
});

export const approveMaintenanceSchema = z.object({
  action: z.nativeEnum(ApprovalAction),
  comments: z.string().optional(),
});

export const assignTechnicianSchema = z.object({
  technicianId: z.string().uuid('Invalid Technician ID'),
  notes: z.string().optional(),
});

export const resolveMaintenanceSchema = z.object({
  resolutionNotes: z.string().min(5, 'Resolution notes are required (min 5 chars)'),
  actualCost: z.number().nonnegative('Cost cannot be negative').optional(),
});
