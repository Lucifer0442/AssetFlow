import { Request, Response, NextFunction } from 'express';
import { DepartmentService } from './service';
import { sendSuccess } from '../../utils/responseFormatter';

export class DepartmentController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dept = await DepartmentService.createDepartment(req.body);
      sendSuccess(res, dept, 'Department created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dept = await DepartmentService.getDepartmentById(req.params.id as string);
      sendSuccess(res, dept);
    } catch (error) {
      next(error);
    }
  }

  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const depts = await DepartmentService.getAllDepartments(search);
      sendSuccess(res, depts);
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dept = await DepartmentService.updateDepartment(req.params.id as string, req.body);
      sendSuccess(res, dept, 'Department updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await DepartmentService.deleteDepartment(req.params.id as string);
      sendSuccess(res, null, 'Department deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
export default DepartmentController;
