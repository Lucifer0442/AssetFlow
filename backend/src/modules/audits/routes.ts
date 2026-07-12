import { Router } from 'express';
import { AuditController } from './controller';
import { validate } from '../../middlewares/validationMiddleware';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { roleMiddleware } from '../../middlewares/roleMiddleware';
import {
  createAuditCycleSchema,
  createAuditAssignmentSchema,
  verifyAuditItemSchema,
  resolveDiscrepancySchema,
} from './validation';
import { uuidSchema } from '../../validators/commonValidators';
import { ROLES } from '../../constants/appConstants';
import { z } from 'zod';

export const auditRouter = Router();

// Apply auth to all routes
auditRouter.use(authMiddleware);

// --- Cycles ---
auditRouter.get('/cycles', AuditController.getAllCycles);
auditRouter.get('/cycles/:id', validate({ params: z.object({ id: uuidSchema }) }), AuditController.getCycleById);

auditRouter.post(
  '/cycles',
  roleMiddleware([ROLES.ADMIN]),
  validate({ body: createAuditCycleSchema }),
  AuditController.createCycle
);

auditRouter.post(
  '/cycles/:id/lock',
  roleMiddleware([ROLES.ADMIN]),
  validate({ params: z.object({ id: uuidSchema }) }),
  AuditController.lockCycle
);

// --- Assignments & Verifications ---
auditRouter.get('/assignments/:id', validate({ params: z.object({ id: uuidSchema }) }), AuditController.getAssignmentById);

auditRouter.post(
  '/assignments',
  roleMiddleware([ROLES.ADMIN]),
  validate({ body: createAuditAssignmentSchema }),
  AuditController.assignAuditor
);

auditRouter.post(
  '/assignments/:id/verify/:itemId',
  roleMiddleware([ROLES.ADMIN, ROLES.AUDITOR]),
  validate({
    params: z.object({
      id: uuidSchema,
      itemId: uuidSchema,
    }),
    body: verifyAuditItemSchema,
  }),
  AuditController.verifyItem
);

// --- Discrepancies ---
auditRouter.post(
  '/discrepancies/:id/resolve',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD]),
  validate({
    params: z.object({ id: uuidSchema }),
    body: resolveDiscrepancySchema,
  }),
  AuditController.resolveDiscrepancy
);

export default auditRouter;
