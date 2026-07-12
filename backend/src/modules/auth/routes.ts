import { Router } from 'express';
import { AuthController } from './controller';
import { validate } from '../../middlewares/validationMiddleware';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { roleMiddleware } from '../../middlewares/roleMiddleware';
import { authRateLimiter } from '../../middlewares/rateLimiter';
import {
  registerSchema,
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  promoteUserSchema,
} from './validation';
import { ROLES } from '../../constants/appConstants';

export const authRouter = Router();

// Public auth endpoints
authRouter.post('/register', authRateLimiter, validate({ body: registerSchema }), AuthController.register);
authRouter.post('/login', authRateLimiter, validate({ body: loginSchema }), AuthController.login);
authRouter.post('/logout', AuthController.logout);
authRouter.post('/forgot-password', validate({ body: requestPasswordResetSchema }), AuthController.requestPasswordReset);
authRouter.post('/reset-password', validate({ body: resetPasswordSchema }), AuthController.resetPassword);

// Protected endpoints
authRouter.post(
  '/promote',
  authMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  validate({ body: promoteUserSchema }),
  AuthController.promote
);

export default authRouter;
