import { prisma } from '../../prisma/prisma';
import { Location } from '@prisma/client';
import { CreateLocationInput, UpdateLocationInput } from './types';

export class LocationRepository {
  public static async create(data: CreateLocationInput): Promise<Location> {
    return prisma.location.create({
      data,
    });
  }

  public static async findById(id: string): Promise<any> {
    return prisma.location.findUnique({
      where: { id },
      include: {
        employees: true,
        assets: true,
        resources: true,
      },
    });
  }

  public static async findByCode(code: string): Promise<Location | null> {
    return prisma.location.findUnique({
      where: { code },
    });
  }

  public static async findAll(search?: string): Promise<Location[]> {
    if (search) {
      return prisma.location.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            { building: { contains: search, mode: 'insensitive' } },
          ],
        },
      });
    }

    return prisma.location.findMany();
  }

  public static async update(id: string, data: UpdateLocationInput): Promise<Location> {
    return prisma.location.update({
      where: { id },
      data,
    });
  }

  public static async delete(id: string): Promise<void> {
    await prisma.location.delete({
      where: { id },
    });
  }
}
export default LocationRepository;
