import { Router } from 'express';
import { CategoryController } from './controller';
import { validate } from '../../middlewares/validationMiddleware';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { roleMiddleware } from '../../middlewares/roleMiddleware';
import { createCategorySchema, updateCategorySchema, addCustomFieldSchema } from './validation';
import { uuidSchema } from '../../validators/commonValidators';
import { ROLES } from '../../constants/appConstants';
import { z } from 'zod';

export const categoryRouter = Router();

// Apply auth to all
categoryRouter.use(authMiddleware);

// Public readers
categoryRouter.get('/', CategoryController.getAll);
categoryRouter.get('/:id', validate({ params: z.object({ id: uuidSchema }) }), CategoryController.getById);

// Restricted modifiers
categoryRouter.post(
  '/',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({ body: createCategorySchema }),
  CategoryController.create
);

categoryRouter.put(
  '/:id',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({
    params: z.object({ id: uuidSchema }),
    body: updateCategorySchema,
  }),
  CategoryController.update
);

categoryRouter.delete(
  '/:id',
  roleMiddleware([ROLES.ADMIN]),
  validate({ params: z.object({ id: uuidSchema }) }),
  CategoryController.delete
);

// Dynamic Field Management endpoints
categoryRouter.post(
  '/:id/fields',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({
    params: z.object({ id: uuidSchema }),
    body: addCustomFieldSchema,
  }),
  CategoryController.addCustomField
);

categoryRouter.delete(
  '/:id/fields/:fieldId',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({
    params: z.object({
      id: uuidSchema,
      fieldId: uuidSchema,
    }),
  }),
  CategoryController.removeCustomField
);

export default categoryRouter;
