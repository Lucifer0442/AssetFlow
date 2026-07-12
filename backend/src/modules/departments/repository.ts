import { prisma } from '../../prisma/prisma';
import { Department } from '@prisma/client';
import { CreateDepartmentInput, UpdateDepartmentInput } from './types';

export class DepartmentRepository {
  public static async create(data: CreateDepartmentInput): Promise<Department> {
    return prisma.department.create({
      data,
    });
  }

  public static async findById(id: string): Promise<Department | null> {
    return prisma.department.findUnique({
      where: { id },
      include: {
        parentDepartment: true,
        childDepartments: true,
        headEmployee: true,
        employees: true,
      },
    });
  }

  public static async findByCode(code: string): Promise<Department | null> {
    return prisma.department.findUnique({
      where: { code },
    });
  }

  public static async findAll(search?: string): Promise<Department[]> {
    if (search) {
      return prisma.department.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
          ],
        },
        include: {
          headEmployee: true,
          parentDepartment: true,
        },
      });
    }

    return prisma.department.findMany({
      include: {
        headEmployee: true,
        parentDepartment: true,
      },
    });
  }

  public static async update(id: string, data: UpdateDepartmentInput): Promise<Department> {
    // Standardize optional fields mapping from nullable
    const updatePayload: any = { ...data };
    if (data.parentDepartmentId === null) {
      updatePayload.parentDepartmentId = null;
    }
    if (data.headEmployeeId === null) {
      updatePayload.headEmployeeId = null;
    }

    return prisma.department.update({
      where: { id },
      data: updatePayload,
    });
  }

  public static async delete(id: string): Promise<void> {
    await prisma.department.delete({
      where: { id },
    });
  }

  public static async findChildren(id: string): Promise<Department[]> {
    return prisma.department.findMany({
      where: { parentDepartmentId: id },
    });
  }
}
export default DepartmentRepository;
