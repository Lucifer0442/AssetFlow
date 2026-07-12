import { Router } from 'express';
import { BookingController } from './controller';
import { validate } from '../../middlewares/validationMiddleware';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { roleMiddleware } from '../../middlewares/roleMiddleware';
import { createResourceSchema, createBookingSchema, cancelBookingSchema } from './validation';
import { uuidSchema } from '../../validators/commonValidators';
import { ROLES } from '../../constants/appConstants';
import { z } from 'zod';

export const bookingRouter = Router();

// Apply auth to all booking routes
bookingRouter.use(authMiddleware);

// --- Resources Endpoints ---
bookingRouter.get('/resources', BookingController.getAllResources);
bookingRouter.get('/resources/:id', validate({ params: z.object({ id: uuidSchema }) }), BookingController.getResourceById);

bookingRouter.post(
  '/resources',
  roleMiddleware([ROLES.ADMIN, ROLES.ASSET_MANAGER]),
  validate({ body: createResourceSchema }),
  BookingController.createResource
);

// --- Bookings Endpoints ---
bookingRouter.get('/', BookingController.getAllBookings);
bookingRouter.get('/:id', validate({ params: z.object({ id: uuidSchema }) }), BookingController.getBookingById);

bookingRouter.post(
  '/',
  validate({ body: createBookingSchema }),
  BookingController.createBooking
);

bookingRouter.post(
  '/:id/cancel',
  validate({
    params: z.object({ id: uuidSchema }),
    body: cancelBookingSchema,
  }),
  BookingController.cancelBooking
);

export default bookingRouter;
