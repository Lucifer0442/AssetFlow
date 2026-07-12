import { Router } from 'express';
import { EmployeeController } from './controller';
import { validate } from '../../middlewares/validationMiddleware';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { roleMiddleware } from '../../middlewares/roleMiddleware';
import { createEmployeeSchema, updateEmployeeSchema } from './validation';
import { uuidSchema } from '../../validators/commonValidators';
import { ROLES } from '../../constants/appConstants';
import { z } from 'zod';

export const employeeRouter = Router();

// Apply auth to all routes
employeeRouter.use(authMiddleware);

// Get current logged-in employee profile
employeeRouter.get('/profile', EmployeeController.getProfile);

// Core employee list routes
employeeRouter.get('/', EmployeeController.getAll);
employeeRouter.get('/:id', validate({ params: z.object({ id: uuidSchema }) }), EmployeeController.getById);

// Admin-only creation/modification routes
employeeRouter.post(
  '/',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({ body: createEmployeeSchema }),
  EmployeeController.create
);

employeeRouter.put(
  '/:id',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({
    params: z.object({ id: uuidSchema }),
    body: updateEmployeeSchema,
  }),
  EmployeeController.update
);

employeeRouter.delete(
  '/:id',
  roleMiddleware([ROLES.ADMIN]),
  validate({ params: z.object({ id: uuidSchema }) }),
  EmployeeController.delete
);

export default employeeRouter;
