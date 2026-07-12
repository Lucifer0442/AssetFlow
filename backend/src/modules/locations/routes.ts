import { Router } from 'express';
import { LocationController } from './controller';
import { validate } from '../../middlewares/validationMiddleware';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { roleMiddleware } from '../../middlewares/roleMiddleware';
import { createLocationSchema, updateLocationSchema } from './validation';
import { uuidSchema } from '../../validators/commonValidators';
import { ROLES } from '../../constants/appConstants';
import { z } from 'zod';

export const locationRouter = Router();

// Auth required
locationRouter.use(authMiddleware);

// Publicly readable
locationRouter.get('/', LocationController.getAll);
locationRouter.get('/:id', validate({ params: z.object({ id: uuidSchema }) }), LocationController.getById);

// Restricted actions
locationRouter.post(
  '/',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({ body: createLocationSchema }),
  LocationController.create
);

locationRouter.put(
  '/:id',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({
    params: z.object({ id: uuidSchema }),
    body: updateLocationSchema,
  }),
  LocationController.update
);

locationRouter.delete(
  '/:id',
  roleMiddleware([ROLES.ADMIN]),
  validate({ params: z.object({ id: uuidSchema }) }),
  LocationController.delete
);

export default locationRouter;
