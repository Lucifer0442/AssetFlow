import { prisma } from '../../prisma/prisma';
import { Asset, AssetStatus, AssetImage, AssetDocument, AssetStatusHistory } from '@prisma/client';
import { CreateAssetInput, UpdateAssetInput } from './types';
import { getSkipAndTake, PaginationParams } from '../../utils/pagination';

export class AssetRepository {
  public static async create(data: CreateAssetInput, createdByEmployeeId?: string): Promise<Asset> {
    return prisma.$transaction(async (tx) => {
      const asset = await tx.asset.create({
        data: {
          assetCode: data.assetCode || `AST-${Date.now()}`,
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          departmentId: data.departmentId,
          locationId: data.locationId,
          status: data.status || AssetStatus.available,
          serialNumber: data.serialNumber,
          assetModel: data.assetModel,
          manufacturer: data.manufacturer,
          purchaseDate: data.purchaseDate,
          purchaseCost: data.purchaseCost,
          warrantyExpiryDate: data.warrantyExpiryDate,
          expectedLifeYears: data.expectedLifeYears,
          customFields: data.customFields || {},
          notes: data.notes,
          createdBy: createdByEmployeeId,
        },
      });

      // Write initial status history log
      await tx.assetStatusHistory.create({
        data: {
          assetId: asset.id,
          newStatus: asset.status,
          changedBy: createdByEmployeeId,
          reason: 'Initial asset registration',
        },
      });

      return asset;
    });
  }

  public static async findById(id: string): Promise<any> {
    return prisma.asset.findUnique({
      where: { id },
      include: {
        category: {
          include: { customFields: true },
        },
        department: true,
        location: true,
        creator: true,
        images: true,
        documents: true,
        statusHistory: {
          include: { changer: true },
          orderBy: { changedAt: 'desc' },
        },
      },
    });
  }

  public static async findByCode(assetCode: string): Promise<Asset | null> {
    return prisma.asset.findUnique({
      where: { assetCode },
    });
  }

  public static async findBySerialNumber(serialNumber: string): Promise<Asset | null> {
    return prisma.asset.findUnique({
      where: { serialNumber },
    });
  }

  public static async findAll(
    pagination: PaginationParams,
    filters: {
      search?: string;
      status?: AssetStatus;
      categoryId?: string;
      departmentId?: string;
      locationId?: string;
    }
  ): Promise<{ data: Asset[]; total: number }> {
    const { skip, take } = getSkipAndTake(pagination);
    const { search, status, categoryId, departmentId, locationId } = filters;

    const where: any = {};

    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (departmentId) where.departmentId = departmentId;
    if (locationId) where.locationId = locationId;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { assetCode: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take,
        include: {
          category: true,
          department: true,
          location: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.asset.count({ where }),
    ]);

    return { data, total };
  }

  public static async update(
    id: string,
    data: UpdateAssetInput,
    changedByEmployeeId?: string,
    statusChangeReason?: string
  ): Promise<Asset> {
    return prisma.$transaction(async (tx) => {
      const current = await tx.asset.findUniqueOrThrow({ where: { id } });

      const updatePayload: any = { ...data };
      if (data.departmentId === null) updatePayload.departmentId = null;
      if (data.locationId === null) updatePayload.locationId = null;

      const updated = await tx.asset.update({
        where: { id },
        data: updatePayload,
      });

      // Write status log if changed
      if (current.status !== updated.status) {
        await tx.assetStatusHistory.create({
          data: {
            assetId: id,
            previousStatus: current.status,
            newStatus: updated.status,
            changedBy: changedByEmployeeId,
            reason: statusChangeReason || 'Status manual update',
          },
        });
      }

      return updated;
    });
  }

  public static async delete(id: string): Promise<void> {
    await prisma.asset.delete({
      where: { id },
    });
  }

  // --- Images and Documents mappings ---

  public static async addImage(assetId: string, imageUrl: string, caption?: string, isPrimary = false): Promise<AssetImage> {
    return prisma.$transaction(async (tx) => {
      if (isPrimary) {
        // Reset old primaries
        await tx.assetImage.updateMany({
          where: { assetId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      return tx.assetImage.create({
        data: {
          assetId,
          imageUrl,
          caption,
          isPrimary,
        },
      });
    });
  }

  public static async addDocument(
    assetId: string,
    documentName: string,
    documentType: string,
    fileUrl: string,
    fileSizeBytes?: number,
    uploadedByEmployeeId?: string
  ): Promise<AssetDocument> {
    return prisma.assetDocument.create({
      data: {
        assetId,
        documentName,
        documentType,
        fileUrl,
        fileSizeBytes,
        uploadedBy: uploadedByEmployeeId,
      },
    });
  }

  public static async getStatusHistory(assetId: string): Promise<AssetStatusHistory[]> {
    return prisma.assetStatusHistory.findMany({
      where: { assetId },
      orderBy: { changedAt: 'desc' },
      include: { changer: true },
    });
  }
}
export default AssetRepository;
