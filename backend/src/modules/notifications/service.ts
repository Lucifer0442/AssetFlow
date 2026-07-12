import { NotificationRepository } from './repository';
import { CreateNotificationInput } from './types';
import { NotFoundError } from '../../errors/customErrors';
import { PaginationParams, formatPaginatedResponse } from '../../utils/pagination';
import { socketBroadcaster } from '../../socket/socketEvents';

export class NotificationService {
  public static async sendNotification(data: CreateNotificationInput, creatorEmployeeId?: string) {
    const notification = await NotificationRepository.create(data, creatorEmployeeId);

    // Emit live Socket.io events
    socketBroadcaster.notifyUsers(data.recipientIds, {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      notificationType: notification.notificationType,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  public static async getEmployeeNotifications(employeeId: string, pagination: PaginationParams, unreadOnly = false) {
    const { data, total } = await NotificationRepository.findAllForEmployee(employeeId, pagination, unreadOnly);
    return formatPaginatedResponse(data, total, pagination);
  }

  public static async markRead(recipientId: string, employeeId: string) {
    const recipient = await prisma.notificationRecipient.findUnique({
      where: { id: recipientId },
    });

    if (!recipient || recipient.employeeId !== employeeId) {
      throw new NotFoundError('Notification recipient record not found');
    }

    return NotificationRepository.markAsRead(recipientId, employeeId);
  }

  public static async markAllRead(employeeId: string) {
    await NotificationRepository.markAllAsRead(employeeId);
  }
}
import { prisma } from '../../prisma/prisma';
export default NotificationService;
