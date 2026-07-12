import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from './service';
import { sendSuccess } from '../../utils/responseFormatter';
import { getPaginationOptions } from '../../utils/pagination';

export class EmployeeController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await EmployeeService.createEmployee(req.body);
      sendSuccess(res, employee, 'Employee profile created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await EmployeeService.getEmployeeById(req.params.id as string);
      sendSuccess(res, employee);
    } catch (error) {
      next(error);
    }
  }

  public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new Error('User context missing');
      }
      const employee = await EmployeeService.getEmployeeByUserId(userId);
      sendSuccess(res, employee);
    } catch (error) {
      next(error);
    }
  }

  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination = getPaginationOptions(req.query.page, req.query.limit);
      const search = req.query.search as string | undefined;
      const departmentId = req.query.departmentId as string | undefined;

      const employees = await EmployeeService.getAllEmployees(pagination, search, departmentId);
      sendSuccess(res, employees);
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await EmployeeService.updateEmployee(req.params.id as string, req.body);
      sendSuccess(res, employee, 'Employee profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await EmployeeService.deleteEmployee(req.params.id as string);
      sendSuccess(res, null, 'Employee profile deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
export default EmployeeController;
