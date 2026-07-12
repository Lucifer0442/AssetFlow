import { ResourceType, BookingStatus } from '@prisma/client';

export interface CreateResourceInput {
  name: string;
  resourceCode: string;
  resourceType: ResourceType;
  description?: string;
  locationId?: string;
  capacity?: number;
  amenities?: string[];
  isActive?: boolean;
}

export interface CreateBookingInput {
  resourceId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  participantIds?: string[];
}
