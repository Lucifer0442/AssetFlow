import { prisma } from '../../prisma/prisma';
import { Employee } from '@prisma/client';
import { CreateEmployeeInput, UpdateEmployeeInput } from './types';
import { getSkipAndTake, PaginationParams } from '../../utils/pagination';

export class EmployeeRepository {
  public static async create(data: CreateEmployeeInput): Promise<Employee> {
    return prisma.employee.create({
      data,
    });
  }

  public static async findById(id: string): Promise<Employee | null> {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            userRoles: {
              include: { role: true },
            },
          },
        },
        department: true,
        location: true,
      },
    });
  }

  public static async findByUserId(userId: string): Promise<Employee | null> {
    return prisma.employee.findUnique({
      where: { userId },
      include: { department: true, location: true },
    });
  }

  public static async findByCode(employeeCode: string): Promise<Employee | null> {
    return prisma.employee.findUnique({
      where: { employeeCode },
    });
  }

  public static async findAll(
    pagination: PaginationParams,
    search?: string,
    departmentId?: string
  ): Promise<{ data: Employee[]; total: number }> {
    const { skip, take } = getSkipAndTake(pagination);

    const where: any = {};
    if (departmentId) {
      where.departmentId = departmentId;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take,
        include: {
          department: true,
          location: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employee.count({ where }),
    ]);

    return { data, total };
  }

  public static async update(id: string, data: UpdateEmployeeInput): Promise<Employee> {
    const updatePayload: any = { ...data };
    if (data.departmentId === null) {
      updatePayload.departmentId = null;
    }
    if (data.locationId === null) {
      updatePayload.locationId = null;
    }

    return prisma.employee.update({
      where: { id },
      data: updatePayload,
    });
  }

  public static async delete(id: string): Promise<void> {
    await prisma.employee.delete({
      where: { id },
    });
  }
}
export default EmployeeRepository;
