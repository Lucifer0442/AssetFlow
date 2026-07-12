import { AssetRepository } from './repository';
import { CreateAssetInput, UpdateAssetInput } from './types';
import { AssetCategory, CategoryCustomField, AssetStatus } from '@prisma/client';
import { ConflictError, NotFoundError, BadRequestError } from '../../errors/customErrors';
import { PaginationParams, formatPaginatedResponse } from '../../utils/pagination';
import { CategoryRepository } from '../categories/repository';

export class AssetService {
  public static async createAsset(data: CreateAssetInput, employeeId?: string) {
    // 1. Verify category exists
    const category = await CategoryRepository.findById(data.categoryId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // 2. Validate custom fields based on category schema
    this.validateCustomFields(category.customFields, data.customFields || {});

    // 3. Uniqueness checks
    if (data.assetCode) {
      const existing = await AssetRepository.findByCode(data.assetCode);
      if (existing) {
        throw new ConflictError(`Asset with code ${data.assetCode} already exists`);
      }
    } else {
      // Auto-generate code: CAT-DEPT-RANDOM
      const catCode = category.code;
      const rand = Math.floor(1000 + Math.random() * 9000);
      data.assetCode = `${catCode}-${rand}`;
    }

    if (data.serialNumber) {
      const existingSerial = await AssetRepository.findBySerialNumber(data.serialNumber);
      if (existingSerial) {
        throw new ConflictError(`Asset with serial number ${data.serialNumber} already exists`);
      }
    }

    return AssetRepository.create(data, employeeId);
  }

  public static async getAssetById(id: string) {
    const asset = await AssetRepository.findById(id);
    if (!asset) {
      throw new NotFoundError('Asset not found');
    }
    return asset;
  }

  public static async getAllAssets(
    pagination: PaginationParams,
    filters: {
      search?: string;
      status?: AssetStatus;
      categoryId?: string;
      departmentId?: string;
      locationId?: string;
    }
  ) {
    const { data, total } = await AssetRepository.findAll(pagination, filters);
    return formatPaginatedResponse(data, total, pagination);
  }

  public static async updateAsset(
    id: string,
    data: UpdateAssetInput,
    employeeId?: string,
    reason?: string
  ) {
    const asset = await AssetRepository.findById(id);
    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    // If changing category, validate custom fields against new category schema
    if (data.categoryId && data.categoryId !== asset.categoryId) {
      const newCategory = await CategoryRepository.findById(data.categoryId);
      if (!newCategory) {
        throw new NotFoundError('New category not found');
      }
      this.validateCustomFields(newCategory.customFields, data.customFields || {});
    } else if (data.customFields) {
      // Validate custom fields against current category schema
      this.validateCustomFields(asset.category.customFields, data.customFields);
    }

    return AssetRepository.update(id, data, employeeId, reason);
  }

  public static async deleteAsset(id: string): Promise<void> {
    const asset = await AssetRepository.findById(id);
    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    // Cannot delete allocated or in-maintenance assets physically in production usually,
    // retired or disposed state is preferred.
    if (asset.status === AssetStatus.allocated) {
      throw new BadRequestError('Cannot delete asset that is currently allocated. Revoke allocation first.');
    }

    await AssetRepository.delete(id);
  }

  public static async addAssetImage(assetId: string, imageUrl: string, caption?: string, isPrimary = false) {
    const asset = await AssetRepository.findById(assetId);
    if (!asset) {
      throw new NotFoundError('Asset not found');
    }
    return AssetRepository.addImage(assetId, imageUrl, caption, isPrimary);
  }

  public static async addAssetDocument(
    assetId: string,
    documentName: string,
    documentType: string,
    fileUrl: string,
    fileSizeBytes?: number,
    employeeId?: string
  ) {
    const asset = await AssetRepository.findById(assetId);
    if (!asset) {
      throw new NotFoundError('Asset not found');
    }
    return AssetRepository.addDocument(assetId, documentName, documentType, fileUrl, fileSizeBytes, employeeId);
  }

  public static async getDepreciation(id: string) {
    const asset = await AssetRepository.findById(id);
    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    const cost = asset.purchaseCost ? Number(asset.purchaseCost) : 0;
    const lifeYears = asset.expectedLifeYears || 5; // Default 5 years
    const purchaseDate = asset.purchaseDate ? new Date(asset.purchaseDate) : new Date(asset.createdAt);

    const ageInYears = (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const yearlyDepreciation = cost / lifeYears;
    const accumulatedDepreciation = Math.min(cost, yearlyDepreciation * ageInYears);
    const bookValue = Math.max(0, cost - accumulatedDepreciation);

    return {
      purchaseCost: cost,
      purchaseDate,
      expectedLifeYears: lifeYears,
      ageInYears: parseFloat(ageInYears.toFixed(2)),
      yearlyDepreciation: parseFloat(yearlyDepreciation.toFixed(2)),
      accumulatedDepreciation: parseFloat(accumulatedDepreciation.toFixed(2)),
      bookValue: parseFloat(bookValue.toFixed(2)),
    };
  }

  // Helper method to validate custom field keys/values against category definitions
  private static validateCustomFields(definitions: CategoryCustomField[], values: Record<string, any>) {
    definitions.forEach((def) => {
      const val = values[def.fieldName];

      if (def.isRequired && (val === undefined || val === null || val === '')) {
        throw new BadRequestError(`Custom field '${def.fieldName}' is required`);
      }

      if (val !== undefined && val !== null && val !== '') {
        if (def.fieldType === 'number' && typeof val !== 'number') {
          throw new BadRequestError(`Custom field '${def.fieldName}' must be a number`);
        }
        if (def.fieldType === 'boolean' && typeof val !== 'boolean') {
          throw new BadRequestError(`Custom field '${def.fieldName}' must be a boolean`);
        }
        if (def.fieldType === 'date') {
          const isDate = !isNaN(Date.parse(val));
          if (!isDate) {
            throw new BadRequestError(`Custom field '${def.fieldName}' must be a valid date`);
          }
        }
        if (def.fieldType === 'select') {
          const options = def.options as string[];
          if (options && !options.includes(val)) {
            throw new BadRequestError(`Custom field '${def.fieldName}' must be one of: ${options.join(', ')}`);
          }
        }
      }
    });
  }
}
export default AssetService;
