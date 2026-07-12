import { Router } from 'express';
import { DepartmentController } from './controller';
import { validate } from '../../middlewares/validationMiddleware';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { roleMiddleware } from '../../middlewares/roleMiddleware';
import { createDepartmentSchema, updateDepartmentSchema } from './validation';
import { uuidSchema } from '../../validators/commonValidators';
import { ROLES } from '../../constants/appConstants';
import { z } from 'zod';

export const departmentRouter = Router();

// Apply auth middleware to all department endpoints
departmentRouter.use(authMiddleware);

// Publicly accessible to authenticated users
departmentRouter.get('/', DepartmentController.getAll);
departmentRouter.get('/:id', validate({ params: z.object({ id: uuidSchema }) }), DepartmentController.getById);

// Restricted modify access
departmentRouter.post(
  '/',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({ body: createDepartmentSchema }),
  DepartmentController.create
);

departmentRouter.put(
  '/:id',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({
    params: z.object({ id: uuidSchema }),
    body: updateDepartmentSchema,
  }),
  DepartmentController.update
);

departmentRouter.delete(
  '/:id',
  roleMiddleware([ROLES.ADMIN]),
  validate({ params: z.object({ id: uuidSchema }) }),
  DepartmentController.delete
);

export default departmentRouter;
