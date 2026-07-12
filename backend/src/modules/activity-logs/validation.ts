import { z } from 'zod';

export const createActivityLogSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().uuid('Invalid Entity ID'),
  details: z.record(z.any()).default({}),
});
