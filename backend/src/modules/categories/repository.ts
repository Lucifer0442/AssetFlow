import { prisma } from '../../prisma/prisma';
import { AssetCategory, CategoryCustomField } from '@prisma/client';
import { CreateCategoryInput, UpdateCategoryInput, CustomFieldInput } from './types';

export class CategoryRepository {
  public static async create(data: CreateCategoryInput): Promise<AssetCategory> {
    return prisma.$transaction(async (tx) => {
      const category = await tx.assetCategory.create({
        data: {
          name: data.name,
          code: data.code,
          description: data.description,
          parentCategoryId: data.parentCategoryId,
          isActive: data.isActive,
        },
      });

      if (data.customFields && data.customFields.length > 0) {
        await tx.categoryCustomField.createMany({
          data: data.customFields.map((field) => ({
            categoryId: category.id,
            fieldName: field.fieldName,
            fieldType: field.fieldType,
            isRequired: field.isRequired ?? false,
            options: field.options ? (field.options as any) : undefined,
            displayOrder: field.displayOrder ?? 0,
          })),
        });
      }

      return tx.assetCategory.findUniqueOrThrow({
        where: { id: category.id },
        include: { customFields: true },
      });
    });
  }

  public static async findById(id: string): Promise<any> {
    return prisma.assetCategory.findUnique({
      where: { id },
      include: {
        parentCategory: true,
        childCategories: true,
        customFields: true,
        assets: true,
      },
    });
  }

  public static async findByCode(code: string): Promise<AssetCategory | null> {
    return prisma.assetCategory.findUnique({
      where: { code },
    });
  }

  public static async findAll(search?: string): Promise<AssetCategory[]> {
    if (search) {
      return prisma.assetCategory.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
          ],
        },
        include: { customFields: true },
      });
    }

    return prisma.assetCategory.findMany({
      include: { customFields: true },
    });
  }

  public static async update(id: string, data: UpdateCategoryInput): Promise<AssetCategory> {
    const updatePayload: any = { ...data };
    if (data.parentCategoryId === null) {
      updatePayload.parentCategoryId = null;
    }

    return prisma.assetCategory.update({
      where: { id },
      data: updatePayload,
      include: { customFields: true },
    });
  }

  public static async delete(id: string): Promise<void> {
    await prisma.assetCategory.delete({
      where: { id },
    });
  }

  public static async findChildren(id: string): Promise<AssetCategory[]> {
    return prisma.assetCategory.findMany({
      where: { parentCategoryId: id },
    });
  }

  // --- Dynamic Custom Fields ---

  public static async addCustomField(categoryId: string, field: CustomFieldInput): Promise<CategoryCustomField> {
    return prisma.categoryCustomField.create({
      data: {
        categoryId,
        fieldName: field.fieldName,
        fieldType: field.fieldType,
        isRequired: field.isRequired ?? false,
        options: field.options ? (field.options as any) : undefined,
        displayOrder: field.displayOrder ?? 0,
      },
    });
  }

  public static async removeCustomField(fieldId: string): Promise<void> {
    await prisma.categoryCustomField.delete({
      where: { id: fieldId },
    });
  }
}
export default CategoryRepository;
