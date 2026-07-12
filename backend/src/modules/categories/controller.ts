import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './service';
import { sendSuccess } from '../../utils/responseFormatter';

export class CategoryController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoryService.createCategory(req.body);
      sendSuccess(res, category, 'Category created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoryService.getCategoryById(req.params.id as string);
      sendSuccess(res, category);
    } catch (error) {
      next(error);
    }
  }

  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const categories = await CategoryService.getAllCategories(search);
      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoryService.updateCategory(req.params.id as string, req.body);
      sendSuccess(res, category, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await CategoryService.deleteCategory(req.params.id as string);
      sendSuccess(res, null, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async addCustomField(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const field = await CategoryService.addCustomField(req.params.id as string, req.body);
      sendSuccess(res, field, 'Custom field added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async removeCustomField(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await CategoryService.removeCustomField(req.params.id as string, req.params.fieldId as string);
      sendSuccess(res, null, 'Custom field removed successfully');
    } catch (error) {
      next(error);
    }
  }
}
export default CategoryController;
