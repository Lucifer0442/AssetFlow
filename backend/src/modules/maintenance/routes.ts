import { Router } from 'express';
import { MaintenanceController } from './controller';
import { validate } from '../../middlewares/validationMiddleware';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { roleMiddleware } from '../../middlewares/roleMiddleware';
import { uploadSingle } from '../../middlewares/uploadMiddleware';
import {
  createMaintenanceSchema,
  approveMaintenanceSchema,
  assignTechnicianSchema,
  resolveMaintenanceSchema,
} from './validation';
import { uuidSchema } from '../../validators/commonValidators';
import { ROLES } from '../../constants/appConstants';
import { z } from 'zod';

export const maintenanceRouter = Router();

// Apply auth to all maintenance endpoints
maintenanceRouter.use(authMiddleware);

// Retrieve listings
maintenanceRouter.get('/', MaintenanceController.getAll);
maintenanceRouter.get('/:id', validate({ params: z.object({ id: uuidSchema }) }), MaintenanceController.getById);

// Create request ticket
maintenanceRouter.post('/', validate({ body: createMaintenanceSchema }), MaintenanceController.create);

// Approvals (Department Heads or Admin deciders)
maintenanceRouter.post(
  '/:id/approve',
  roleMiddleware([ROLES.ADMIN, ROLES.DEPARTMENT_HEAD]),
  validate({
    params: z.object({ id: uuidSchema }),
    body: approveMaintenanceSchema,
  }),
  MaintenanceController.approve
);

// Technician assignments (Admins/Asset Managers only)
maintenanceRouter.post(
  '/:id/assign',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({
    params: z.object({ id: uuidSchema }),
    body: assignTechnicianSchema,
  }),
  MaintenanceController.assign
);

// Start work (Technicians assigned to ticket only)
maintenanceRouter.post(
  '/:id/start',
  roleMiddleware([ROLES.ADMIN, ROLES.TECHNICIAN]),
  validate({ params: z.object({ id: uuidSchema }) }),
  MaintenanceController.startWork
);

// Resolve ticket (Technicians only)
maintenanceRouter.post(
  '/:id/resolve',
  roleMiddleware([ROLES.ADMIN, ROLES.TECHNICIAN]),
  validate({
    params: z.object({ id: uuidSchema }),
    body: resolveMaintenanceSchema,
  }),
  MaintenanceController.resolve
);

// Close ticket (Admins/Asset Managers only)
maintenanceRouter.post(
  '/:id/close',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({ params: z.object({ id: uuidSchema }) }),
  MaintenanceController.close
);

// Ticket attachments upload
maintenanceRouter.post(
  '/:id/attachments',
  validate({ params: z.object({ id: uuidSchema }) }),
  uploadSingle('file'),
  MaintenanceController.addAttachment
);

export default maintenanceRouter;
