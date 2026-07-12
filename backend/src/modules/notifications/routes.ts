import { Router } from 'express';
import { NotificationController } from './controller';
import { validate } from '../../middlewares/validationMiddleware';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { roleMiddleware } from '../../middlewares/roleMiddleware';
import { createNotificationSchema } from './validation';
import { uuidSchema } from '../../validators/commonValidators';
import { ROLES } from '../../constants/appConstants';
import { z } from 'zod';

export const notificationRouter = Router();

// Apply auth to all notification routes
notificationRouter.use(authMiddleware);

// Get my notifications
notificationRouter.get('/', NotificationController.getMyNotifications);

// Mark read Actions
notificationRouter.post('/read-all', NotificationController.markAllRead);
notificationRouter.post('/:id/read', validate({ params: z.object({ id: uuidSchema }) }), NotificationController.markRead);

// Send custom system notifications (Admin only)
notificationRouter.post(
  '/',
  roleMiddleware([ROLES.ADMIN]),
  validate({ body: createNotificationSchema }),
  NotificationController.send
);

export default notificationRouter;
