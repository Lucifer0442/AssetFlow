import { NotificationType } from '@prisma/client';

export interface CreateNotificationInput {
  title: string;
  message: string;
  notificationType?: NotificationType;
  referenceType?: string;
  referenceId?: string;
  recipientIds: string[]; // employee ids to send to
}
