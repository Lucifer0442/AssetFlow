import { z } from 'zod';
import { NotificationType } from '@prisma/client';

export const createNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  message: z.string().min(1, 'Message is required'),
  notificationType: z.nativeEnum(NotificationType).default(NotificationType.info),
  referenceType: z.string().optional(),
  referenceId: z.string().uuid().optional(),
  recipientIds: z.array(z.string().uuid('Invalid Recipient Employee ID')).min(1, 'At least one recipient is required'),
});
