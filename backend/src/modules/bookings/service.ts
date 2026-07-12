import { BookingRepository } from './repository';
import { CreateResourceInput, CreateBookingInput } from './types';
import { ConflictError, NotFoundError, BadRequestError } from '../../errors/customErrors';
import { PaginationParams, formatPaginatedResponse } from '../../utils/pagination';
import { socketBroadcaster } from '../../socket/socketEvents';
import { socketEvents } from '../../config/socket';

export class BookingService {
  // --- Resources ---

  public static async createResource(data: CreateResourceInput) {
    const existing = await BookingRepository.findResourceByCode(data.resourceCode);
    if (existing) {
      throw new ConflictError(`Resource with code ${data.resourceCode} already exists`);
    }

    return BookingRepository.createResource(data);
  }

  public static async getResourceById(id: string) {
    const resource = await BookingRepository.findResourceById(id);
    if (!resource) {
      throw new NotFoundError('Resource not found');
    }
    return resource;
  }

  public static async getAllResources() {
    return BookingRepository.findAllResources();
  }

  // --- Bookings ---

  public static async createBooking(data: CreateBookingInput, employeeId: string) {
    // 1. Verify resource exists and is active
    const resource = await BookingRepository.findResourceById(data.resourceId);
    if (!resource || !resource.isActive) {
      throw new BadRequestError('Resource not found or is currently inactive');
    }

    // 2. Check for overlaps
    const overlaps = await BookingRepository.checkOverlappingBookings(data.resourceId, data.startTime, data.endTime);
    if (overlaps.length > 0) {
      throw new ConflictError('Resource is already booked during this time range');
    }

    // 3. Create booking
    const booking = await BookingRepository.createBooking(data, employeeId);

    // 4. Emit real-time updates via Socket.io
    socketBroadcaster.broadcastBookingUpdate(socketEvents.BOOKING.CREATED, {
      id: booking.id,
      title: booking.title,
      resourceName: resource.name,
      startTime: booking.startTime,
      endTime: booking.endTime,
    });

    return booking;
  }

  public static async getBookingById(id: string) {
    const booking = await BookingRepository.findBookingById(id);
    if (!booking) {
      throw new NotFoundError('Booking record not found');
    }
    return booking;
  }

  public static async getAllBookings(pagination: PaginationParams, resourceId?: string, employeeId?: string) {
    const { data, total } = await BookingRepository.findAllBookings(pagination, resourceId, employeeId);
    return formatPaginatedResponse(data, total, pagination);
  }

  public static async cancelBooking(id: string, reason: string, employeeId: string, isAdmin = false) {
    const booking = await BookingRepository.findBookingById(id);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.status === 'cancelled') {
      throw new BadRequestError('Booking is already cancelled');
    }

    // Authorize: Only the booker or an admin can cancel
    if (booking.bookedBy !== employeeId && !isAdmin) {
      throw new BadRequestError('You do not have permission to cancel this booking');
    }

    const cancelled = await BookingRepository.cancelBooking(id, reason);

    // Socket alert
    socketBroadcaster.broadcastBookingUpdate(socketEvents.BOOKING.CANCELLED, {
      id: cancelled.id,
      resourceName: cancelled.resource.name,
      title: cancelled.title,
      cancelledReason: reason,
    });

    return cancelled;
  }
}
export default BookingService;
