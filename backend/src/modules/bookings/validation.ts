import { z } from 'zod';
import { ResourceType, BookingStatus } from '@prisma/client';

export const createResourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  resourceCode: z.string().min(1, 'Code is required').toUpperCase(),
  resourceType: z.nativeEnum(ResourceType),
  description: z.string().optional(),
  locationId: z.string().uuid('Invalid Location ID').optional(),
  capacity: z.number().int().positive('Capacity must be positive').optional(),
  amenities: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const createBookingSchema = z.object({
  resourceId: z.string().uuid('Invalid Resource ID'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  participantIds: z.array(z.string().uuid('Invalid Participant Employee ID')).optional(),
}).refine((data) => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const cancelBookingSchema = z.object({
  cancelledReason: z.string().min(1, 'Cancellation reason is required'),
});
