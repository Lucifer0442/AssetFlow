import { prisma } from '../../prisma/prisma';
import { ActivityLog } from '@prisma/client';
import { CreateActivityLogInput } from './types';
import { getSkipAndTake, PaginationParams } from '../../utils/pagination';

export class ActivityLogRepository {
  public static async create(data: CreateActivityLogInput): Promise<ActivityLog> {
    return prisma.activityLog.create({
      data: {
        actorId: data.actorId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  public static async findById(id: string): Promise<ActivityLog | null> {
    return prisma.activityLog.findUnique({
      where: { id },
      include: { actor: true },
    });
  }

  public static async findAll(
    pagination: PaginationParams,
    filters: {
      actorId?: string;
      action?: string;
      entityType?: string;
    }
  ): Promise<{ data: ActivityLog[]; total: number }> {
    const { skip, take } = getSkipAndTake(pagination);
    const { actorId, action, entityType } = filters;

    const where: any = {};
    if (actorId) where.actorId = actorId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;

    const [data, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take,
        include: { actor: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return { data, total };
  }
}
export default ActivityLogRepository;
