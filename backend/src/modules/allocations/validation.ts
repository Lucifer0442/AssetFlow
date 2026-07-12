import { z } from 'zod';

export const createAllocationSchema = z.object({
  assetId: z.string().uuid('Invalid Asset ID'),
  employeeId: z.string().uuid('Invalid Employee ID'),
  expectedReturnDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const returnAssetSchema = z.object({
  allocationId: z.string().uuid('Invalid Allocation ID'),
  conditionNotes: z.string().optional(),
  returnCondition: z.enum(['good', 'fair', 'damaged']).default('good'),
});

export const createTransferRequestSchema = z.object({
  allocationId: z.string().uuid('Invalid Allocation ID'),
  toEmployeeId: z.string().uuid('Invalid Target Employee ID'),
  reason: z.string().min(5, 'Reason must be at least 5 characters long'),
});

export const updateTransferStatusSchema = z.object({
  action: z.enum(['approve', 'reject']),
});
