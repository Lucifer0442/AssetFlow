import { Request, Response, NextFunction } from 'express';
import { ActivityLogService } from './service';
import { sendSuccess } from '../../utils/responseFormatter';
import { getPaginationOptions } from '../../utils/pagination';

export class ActivityLogController {
  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const log = await ActivityLogService.getLogById(req.params.id as string);
      sendSuccess(res, log);
    } catch (error) {
      next(error);
    }
  }

  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination = getPaginationOptions(req.query.page, req.query.limit);
      const filters = {
        actorId: req.query.actorId as string | undefined,
        action: req.query.action as string | undefined,
        entityType: req.query.entityType as string | undefined,
      };

      const logs = await ActivityLogService.getAllLogs(pagination, filters);
      sendSuccess(res, logs);
    } catch (error) {
      next(error);
    }
  }
}
export default ActivityLogController;
