import { prisma } from '../../prisma/prisma';
import { Notification, NotificationRecipient, NotificationType } from '@prisma/client';
import { CreateNotificationInput } from './types';
import { getSkipAndTake, PaginationParams } from '../../utils/pagination';

export class NotificationRepository {
  public static async create(data: CreateNotificationInput, createdByEmployeeId?: string): Promise<Notification> {
    return prisma.$transaction(async (tx) => {
      const notification = await tx.notification.create({
        data: {
          title: data.title,
          message: data.message,
          notificationType: data.notificationType || NotificationType.info,
          referenceType: data.referenceType,
          referenceId: data.referenceId,
          createdBy: createdByEmployeeId,
        },
      });

      await tx.notificationRecipient.createMany({
        data: data.recipientIds.map((empId) => ({
          notificationId: notification.id,
          employeeId: empId,
          isRead: false,
        })),
      });

      return tx.notification.findUniqueOrThrow({
        where: { id: notification.id },
        include: { recipients: true },
      });
    });
  }

  public static async findAllForEmployee(
    employeeId: string,
    pagination: PaginationParams,
    unreadOnly = false
  ): Promise<{ data: any[]; total: number }> {
    const { skip, take } = getSkipAndTake(pagination);

    const where: any = {
      employeeId,
    };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [recipients, total] = await Promise.all([
      prisma.notificationRecipient.findMany({
        where,
        skip,
        take,
        include: {
          notification: true,
        },
        orderBy: {
          notification: {
            createdAt: 'desc',
          },
        },
      }),
      prisma.notificationRecipient.count({ where }),
    ]);

    // Format output mapping the actual notification entity
    const data = recipients.map((r) => ({
      id: r.id,
      notificationId: r.notificationId,
      title: r.notification.title,
      message: r.notification.message,
      notificationType: r.notification.notificationType,
      referenceType: r.notification.referenceType,
      referenceId: r.notification.referenceId,
      createdAt: r.notification.createdAt,
      isRead: r.isRead,
      readAt: r.readAt,
    }));

    return { data, total };
  }

  public static async markAsRead(recipientId: string, employeeId: string): Promise<NotificationRecipient> {
    return prisma.notificationRecipient.update({
      where: {
        id: recipientId,
        employeeId, // ensure target ownership match
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  public static async markAllAsRead(employeeId: string): Promise<void> {
    await prisma.notificationRecipient.updateMany({
      where: {
        employeeId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}
export default NotificationRepository;
