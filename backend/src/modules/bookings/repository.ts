import { prisma } from '../../prisma/prisma';
import { Resource, ResourceBooking, BookingStatus } from '@prisma/client';
import { CreateResourceInput, CreateBookingInput } from './types';
import { getSkipAndTake, PaginationParams } from '../../utils/pagination';

export class BookingRepository {
  // --- Resource CRUD ---

  public static async createResource(data: CreateResourceInput): Promise<Resource> {
    return prisma.resource.create({
      data: {
        name: data.name,
        resourceCode: data.resourceCode,
        resourceType: data.resourceType,
        description: data.description,
        locationId: data.locationId,
        capacity: data.capacity,
        amenities: data.amenities || [],
        isActive: data.isActive ?? true,
      },
    });
  }

  public static async findResourceById(id: string): Promise<Resource | null> {
    return prisma.resource.findUnique({
      where: { id },
      include: { location: true },
    });
  }

  public static async findResourceByCode(resourceCode: string): Promise<Resource | null> {
    return prisma.resource.findUnique({
      where: { resourceCode },
    });
  }

  public static async findAllResources(): Promise<Resource[]> {
    return prisma.resource.findMany({
      include: { location: true },
    });
  }

  // --- Bookings ---

  public static async createBooking(data: CreateBookingInput, bookedByEmployeeId: string): Promise<ResourceBooking> {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.resourceBooking.create({
        data: {
          resourceId: data.resourceId,
          bookedBy: bookedByEmployeeId,
          title: data.title,
          description: data.description,
          startTime: data.startTime,
          endTime: data.endTime,
          status: BookingStatus.upcoming,
        },
      });

      if (data.participantIds && data.participantIds.length > 0) {
        await tx.bookingParticipant.createMany({
          data: data.participantIds.map((empId) => ({
            bookingId: booking.id,
            employeeId: empId,
          })),
        });
      }

      return tx.resourceBooking.findUniqueOrThrow({
        where: { id: booking.id },
        include: {
          resource: true,
          booker: true,
          participants: {
            include: { employee: true },
          },
        },
      });
    });
  }

  public static async findBookingById(id: string) {
    return prisma.resourceBooking.findUnique({
      where: { id },
      include: {
        resource: true,
        booker: true,
        participants: {
          include: { employee: true },
        },
      },
    });
  }

  public static async checkOverlappingBookings(
    resourceId: string,
    startTime: Date,
    endTime: Date
  ): Promise<ResourceBooking[]> {
    return prisma.resourceBooking.findMany({
      where: {
        resourceId,
        status: { not: BookingStatus.cancelled },
        // Check for overlaps: startA < endB AND startB < endA
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });
  }

  public static async findAllBookings(
    pagination: PaginationParams,
    resourceId?: string,
    employeeId?: string
  ): Promise<{ data: any[]; total: number }> {
    const { skip, take } = getSkipAndTake(pagination);

    const where: any = {};
    if (resourceId) where.resourceId = resourceId;
    if (employeeId) where.bookedBy = employeeId;

    const [data, total] = await Promise.all([
      prisma.resourceBooking.findMany({
        where,
        skip,
        take,
        include: {
          resource: true,
          booker: true,
        },
        orderBy: { startTime: 'desc' },
      }),
      prisma.resourceBooking.count({ where }),
    ]);

    return { data, total };
  }

  public static async cancelBooking(id: string, reason: string): Promise<any> {
    return prisma.resourceBooking.update({
      where: { id },
      data: {
        status: BookingStatus.cancelled,
        cancelledReason: reason,
      },
      include: {
        resource: true,
        booker: true,
      },
    });
  }
}
export default BookingRepository;
