import { ActivityLogRepository } from './repository';
import { CreateActivityLogInput } from './types';
import { NotFoundError } from '../../errors/customErrors';
import { PaginationParams, formatPaginatedResponse } from '../../utils/pagination';

export class ActivityLogService {
  public static async log(data: CreateActivityLogInput) {
    return ActivityLogRepository.create(data);
  }

  public static async getLogById(id: string) {
    const log = await ActivityLogRepository.findById(id);
    if (!log) {
      throw new NotFoundError('Activity log not found');
    }
    return log;
  }

  public static async getAllLogs(
    pagination: PaginationParams,
    filters: {
      actorId?: string;
      action?: string;
      entityType?: string;
    }
  ) {
    const { data, total } = await ActivityLogRepository.findAll(pagination, filters);
    return formatPaginatedResponse(data, total, pagination);
  }
}
export default ActivityLogService;
