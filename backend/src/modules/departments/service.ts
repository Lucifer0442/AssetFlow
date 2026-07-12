import { DepartmentRepository } from './repository';
import { CreateDepartmentInput, UpdateDepartmentInput } from './types';
import { ConflictError, NotFoundError, BadRequestError } from '../../errors/customErrors';

export class DepartmentService {
  public static async createDepartment(data: CreateDepartmentInput) {
    const existing = await DepartmentRepository.findByCode(data.code);
    if (existing) {
      throw new ConflictError(`Department code ${data.code} is already in use`);
    }

    if (data.parentDepartmentId) {
      const parent = await DepartmentRepository.findById(data.parentDepartmentId);
      if (!parent) {
        throw new NotFoundError('Parent department not found');
      }
    }

    return DepartmentRepository.create(data);
  }

  public static async getDepartmentById(id: string) {
    const dept = await DepartmentRepository.findById(id);
    if (!dept) {
      throw new NotFoundError('Department not found');
    }
    return dept;
  }

  public static async getAllDepartments(search?: string) {
    return DepartmentRepository.findAll(search);
  }

  public static async updateDepartment(id: string, data: UpdateDepartmentInput) {
    const dept = await DepartmentRepository.findById(id);
    if (!dept) {
      throw new NotFoundError('Department not found');
    }

    // Circular reference check
    if (data.parentDepartmentId && data.parentDepartmentId === id) {
      throw new BadRequestError('A department cannot be its own parent');
    }

    return DepartmentRepository.update(id, data);
  }

  public static async deleteDepartment(id: string): Promise<void> {
    const dept = await DepartmentRepository.findById(id);
    if (!dept) {
      throw new NotFoundError('Department not found');
    }

    const children = await DepartmentRepository.findChildren(id);
    if (children.length > 0) {
      throw new BadRequestError('Cannot delete a department that has child departments. Re-assign them first.');
    }

    await DepartmentRepository.delete(id);
  }
}
export default DepartmentService;
