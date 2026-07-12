import { z } from 'zod';
import { EmployeeStatus } from '@prisma/client';

export const createEmployeeSchema = z.object({
  userId: z.string().uuid('Invalid User ID'),
  employeeCode: z.string().min(3).max(20).toUpperCase(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  designation: z.string().optional(),
  departmentId: z.string().uuid('Invalid Department ID').optional(),
  locationId: z.string().uuid('Invalid Location ID').optional(),
  status: z.nativeEnum(EmployeeStatus).default(EmployeeStatus.active),
  dateOfJoining: z.coerce.date().optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
});

export const updateEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name cannot be empty').optional(),
  lastName: z.string().min(1, 'Last name cannot be empty').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  designation: z.string().optional(),
  departmentId: z.string().uuid('Invalid Department ID').nullable().optional(),
  locationId: z.string().uuid('Invalid Location ID').nullable().optional(),
  status: z.nativeEnum(EmployeeStatus).optional(),
  dateOfJoining: z.coerce.date().optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
});
