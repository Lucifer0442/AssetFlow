import { AssetStatus } from '@prisma/client';

export interface CreateAssetInput {
  name: string;
  categoryId: string;
  assetCode?: string; // auto-generated if empty
  description?: string;
  departmentId?: string;
  locationId?: string;
  status?: AssetStatus;
  serialNumber?: string;
  assetModel?: string;
  manufacturer?: string;
  purchaseDate?: Date;
  purchaseCost?: number;
  warrantyExpiryDate?: Date;
  expectedLifeYears?: number;
  customFields?: Record<string, any>;
  notes?: string;
  createdBy?: string;
}

export interface UpdateAssetInput {
  name?: string;
  categoryId?: string;
  description?: string;
  departmentId?: string;
  locationId?: string;
  status?: AssetStatus;
  serialNumber?: string;
  assetModel?: string;
  manufacturer?: string;
  purchaseDate?: Date;
  purchaseCost?: number;
  warrantyExpiryDate?: Date;
  expectedLifeYears?: number;
  customFields?: Record<string, any>;
  notes?: string;
}
