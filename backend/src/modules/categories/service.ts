import { CategoryRepository } from './repository';
import { CreateCategoryInput, UpdateCategoryInput, CustomFieldInput } from './types';
import { ConflictError, NotFoundError, BadRequestError } from '../../errors/customErrors';

export class CategoryService {
  public static async createCategory(data: CreateCategoryInput) {
    const existing = await CategoryRepository.findByCode(data.code);
    if (existing) {
      throw new ConflictError(`Category code ${data.code} already exists`);
    }

    if (data.parentCategoryId) {
      const parent = await CategoryRepository.findById(data.parentCategoryId);
      if (!parent) {
        throw new NotFoundError('Parent category not found');
      }
    }

    return CategoryRepository.create(data);
  }

  public static async getCategoryById(id: string) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  public static async getAllCategories(search?: string) {
    return CategoryRepository.findAll(search);
  }

  public static async updateCategory(id: string, data: UpdateCategoryInput) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (data.parentCategoryId && data.parentCategoryId === id) {
      throw new BadRequestError('A category cannot be its own parent');
    }

    return CategoryRepository.update(id, data);
  }

  public static async deleteCategory(id: string): Promise<void> {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const children = await CategoryRepository.findChildren(id);
    if (children.length > 0) {
      throw new BadRequestError('Cannot delete category that has subcategories. Re-assign them first.');
    }

    if (category.assets.length > 0) {
      throw new BadRequestError('Cannot delete category linked to active assets');
    }

    await CategoryRepository.delete(id);
  }

  public static async addCustomField(categoryId: string, field: CustomFieldInput) {
    const category = await CategoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Check duplicate fields in category
    const duplicate = category.customFields.some((f: any) => f.fieldName.toLowerCase() === field.fieldName.toLowerCase());
    if (duplicate) {
      throw new ConflictError(`Custom field ${field.fieldName} already exists in this category`);
    }

    return CategoryRepository.addCustomField(categoryId, field);
  }

  public static async removeCustomField(categoryId: string, fieldId: string): Promise<void> {
    const category = await CategoryService.getCategoryById(categoryId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const hasField = category.customFields.some((f: any) => f.id === fieldId);
    if (!hasField) {
      throw new NotFoundError('Custom field not found in this category');
    }

    await CategoryRepository.removeCustomField(fieldId);
  }
}
export default CategoryService;
