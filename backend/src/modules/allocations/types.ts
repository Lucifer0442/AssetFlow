import { AllocationStatus, TransferRequestStatus } from '@prisma/client';

export interface CreateAllocationInput {
  assetId: string;
  employeeId: string;
  expectedReturnDate?: Date;
  notes?: string;
}

export interface ReturnAssetInput {
  allocationId: string;
  conditionNotes?: string;
  returnCondition: 'good' | 'fair' | 'damaged';
}

export interface CreateTransferRequestInput {
  allocationId: string;
  toEmployeeId: string;
  reason: string;
}
