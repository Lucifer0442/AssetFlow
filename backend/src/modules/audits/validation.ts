import { z } from 'zod';
import { AuditResult } from '@prisma/client';

export const createAuditCycleSchema = z.object({
  cycleCode: z.string().min(2, 'Cycle code is required').toUpperCase(),
  name: z.string().min(3, 'Name must be at least 3 chars'),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});

export const createAuditAssignmentSchema = z.object({
  auditCycleId: z.string().uuid('Invalid Cycle ID'),
  auditorId: z.string().uuid('Invalid Auditor Employee ID'),
  departmentId: z.string().uuid('Invalid Department ID'),
});

export const verifyAuditItemSchema = z.object({
  result: z.nativeEnum(AuditResult),
  conditionNotes: z.string().optional(),
  locationVerified: z.boolean(),
});

export const resolveDiscrepancySchema = z.object({
  resolution: z.string().min(5, 'Resolution notes are required (min 5 chars)'),
});
