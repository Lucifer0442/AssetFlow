import { z } from 'zod';
import { DepartmentStatus } from '@prisma/client';

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(2, 'Code must be at least 2 chars').max(20).toUpperCase(),
  description: z.string().optional(),
  parentDepartmentId: z.string().uuid('Invalid parent ID').optional(),
  headEmployeeId: z.string().uuid('Invalid head employee ID').optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(100).optional(),
  description: z.string().optional(),
  parentDepartmentId: z.string().uuid('Invalid parent ID').nullable().optional(),
  headEmployeeId: z.string().uuid('Invalid head employee ID').nullable().optional(),
  status: z.nativeEnum(DepartmentStatus).optional(),
});
