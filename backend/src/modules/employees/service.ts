import { EmployeeRepository } from './repository';
import { CreateEmployeeInput, UpdateEmployeeInput } from './types';
import { ConflictError, NotFoundError } from '../../errors/customErrors';
import { PaginationParams, formatPaginatedResponse } from '../../utils/pagination';

export class EmployeeService {
  public static async createEmployee(data: CreateEmployeeInput) {
    const existing = await EmployeeRepository.findByCode(data.employeeCode);
    if (existing) {
      throw new ConflictError(`Employee with code ${data.employeeCode} already exists`);
    }

    return EmployeeRepository.create(data);
  }

  public static async getEmployeeById(id: string) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }
    return employee;
  }

  public static async getEmployeeByUserId(userId: string) {
    const employee = await EmployeeRepository.findByUserId(userId);
    if (!employee) {
      throw new NotFoundError('Employee profile not found for this user account');
    }
    return employee;
  }

  public static async getAllEmployees(pagination: PaginationParams, search?: string, departmentId?: string) {
    const { data, total } = await EmployeeRepository.findAll(pagination, search, departmentId);
    return formatPaginatedResponse(data, total, pagination);
  }

  public static async updateEmployee(id: string, data: UpdateEmployeeInput) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    return EmployeeRepository.update(id, data);
  }

  public static async deleteEmployee(id: string): Promise<void> {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    await EmployeeRepository.delete(id);
  }
}
export default EmployeeService;
