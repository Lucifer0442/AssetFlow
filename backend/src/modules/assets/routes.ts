import { Router } from 'express';
import { AssetController } from './controller';
import { validate } from '../../middlewares/validationMiddleware';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { roleMiddleware } from '../../middlewares/roleMiddleware';
import { uploadSingle } from '../../middlewares/uploadMiddleware';
import { createAssetSchema, updateAssetSchema } from './validation';
import { uuidSchema } from '../../validators/commonValidators';
import { ROLES } from '../../constants/appConstants';
import { z } from 'zod';

export const assetRouter = Router();

// Apply auth to all
assetRouter.use(authMiddleware);

// Readers
assetRouter.get('/', AssetController.getAll);
assetRouter.get('/:id', validate({ params: z.object({ id: uuidSchema }) }), AssetController.getById);
assetRouter.get('/:id/depreciation', validate({ params: z.object({ id: uuidSchema }) }), AssetController.getDepreciation);

// Restricted actions
assetRouter.post(
  '/',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({ body: createAssetSchema }),
  AssetController.create
);

assetRouter.put(
  '/:id',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({
    params: z.object({ id: uuidSchema }),
    body: updateAssetSchema,
  }),
  AssetController.update
);

assetRouter.delete(
  '/:id',
  roleMiddleware([ROLES.ADMIN]),
  validate({ params: z.object({ id: uuidSchema }) }),
  AssetController.delete
);

// File upload endpoints (Restricted to admin/asset manager)
assetRouter.post(
  '/:id/images',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({ params: z.object({ id: uuidSchema }) }),
  uploadSingle('image'),
  AssetController.addImage
);

assetRouter.post(
  '/:id/documents',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({ params: z.object({ id: uuidSchema }) }),
  uploadSingle('document'),
  AssetController.addDocument
);

export default assetRouter;
