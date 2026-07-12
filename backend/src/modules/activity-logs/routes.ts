import { Router } from 'express';
import { ActivityLogController } from './controller';
import { validate } from '../../middlewares/validationMiddleware';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { roleMiddleware } from '../../middlewares/roleMiddleware';
import { uuidSchema } from '../../validators/commonValidators';
import { ROLES } from '../../constants/appConstants';
import { z } from 'zod';

export const activityLogRouter = Router();

// Apply auth + admin lock to all logs endpoints
activityLogRouter.use(authMiddleware);
activityLogRouter.use(roleMiddleware([ROLES.ADMIN]));

activityLogRouter.get('/', ActivityLogController.getAll);
activityLogRouter.get('/:id', validate({ params: z.object({ id: uuidSchema }) }), ActivityLogController.getById);

export default activityLogRouter;
