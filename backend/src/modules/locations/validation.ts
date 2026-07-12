import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(2, 'Code must be at least 2 chars').max(20).toUpperCase(),
  address: z.string().optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
  room: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateLocationSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(100).optional(),
  address: z.string().optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
  room: z.string().optional(),
  isActive: z.boolean().optional(),
});
