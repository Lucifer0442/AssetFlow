import { Router } from 'express';
import { AllocationController } from './controller';
import { validate } from '../../middlewares/validationMiddleware';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { roleMiddleware } from '../../middlewares/roleMiddleware';
import {
  createAllocationSchema,
  returnAssetSchema,
  createTransferRequestSchema,
  updateTransferStatusSchema,
} from './validation';
import { uuidSchema } from '../../validators/commonValidators';
import { ROLES } from '../../constants/appConstants';
import { z } from 'zod';

export const allocationRouter = Router();

// Apply auth to all allocation endpoints
allocationRouter.use(authMiddleware);

// Get allocations directory
allocationRouter.get('/', AllocationController.getAll);
allocationRouter.get('/:id', validate({ params: z.object({ id: uuidSchema }) }), AllocationController.getById);

// Allocate and Return Assets (Asset Managers and Admins only)
allocationRouter.post(
  '/',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({ body: createAllocationSchema }),
  AllocationController.allocate
);

allocationRouter.post(
  '/returns',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({ body: returnAssetSchema }),
  AllocationController.returnAsset
);

// Transfers flow (Any logged-in user can request to transfer)
allocationRouter.post(
  '/transfers',
  validate({ body: createTransferRequestSchema }),
  AllocationController.createTransfer
);

// Approve/Reject Transfer requests (Admin and Department Head deciders)
allocationRouter.post(
  '/transfers/:id/action',
  roleMiddleware([ROLES.ADMIN, ROLES.DEPARTMENT_HEAD]),
  validate({
    params: z.object({ id: uuidSchema }),
    body: updateTransferStatusSchema,
  }),
  AllocationController.handleTransfer
);

export default allocationRouter;
