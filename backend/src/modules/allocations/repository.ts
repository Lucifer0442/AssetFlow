import { prisma } from '../../prisma/prisma';
import { AssetAllocation, AssetReturn, AssetTransferRequest, AllocationStatus, AssetStatus, TransferRequestStatus } from '@prisma/client';
import { CreateAllocationInput, ReturnAssetInput, CreateTransferRequestInput } from './types';
import { getSkipAndTake, PaginationParams } from '../../utils/pagination';

export class AllocationRepository {
  public static async create(data: CreateAllocationInput, allocatedByEmployeeId: string, departmentId: string): Promise<AssetAllocation> {
    return prisma.$transaction(async (tx) => {
      // 1. Create the allocation
      const allocation = await tx.assetAllocation.create({
        data: {
          assetId: data.assetId,
          employeeId: data.employeeId,
          departmentId,
          allocatedBy: allocatedByEmployeeId,
          status: AllocationStatus.active,
          expectedReturnDate: data.expectedReturnDate,
          notes: data.notes,
        },
      });

      // 2. Update the asset status
      await tx.asset.update({
        where: { id: data.assetId },
        data: { status: AssetStatus.allocated, departmentId },
      });

      // 3. Write status history log
      await tx.assetStatusHistory.create({
        data: {
          assetId: data.assetId,
          previousStatus: AssetStatus.available,
          newStatus: AssetStatus.allocated,
          changedBy: allocatedByEmployeeId,
          reason: `Asset allocated to employee ${data.employeeId}`,
        },
      });

      return allocation;
    });
  }

  public static async findById(id: string) {
    return prisma.assetAllocation.findUnique({
      where: { id },
      include: {
        asset: true,
        employee: true,
        department: true,
        allocator: true,
      },
    });
  }

  public static async findActiveByAssetId(assetId: string): Promise<AssetAllocation | null> {
    return prisma.assetAllocation.findFirst({
      where: { assetId, status: AllocationStatus.active },
    });
  }

  public static async findAll(
    pagination: PaginationParams,
    employeeId?: string,
    status?: AllocationStatus
  ): Promise<{ data: any[]; total: number }> {
    const { skip, take } = getSkipAndTake(pagination);

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.assetAllocation.findMany({
        where,
        skip,
        take,
        include: {
          asset: true,
          employee: true,
          department: true,
        },
        orderBy: { allocatedAt: 'desc' },
      }),
      prisma.assetAllocation.count({ where }),
    ]);

    return { data, total };
  }

  // --- Returns logic ---

  public static async return(data: ReturnAssetInput, receivedByEmployeeId: string): Promise<AssetReturn> {
    return prisma.$transaction(async (tx) => {
      // 1. Get the allocation details
      const allocation = await tx.assetAllocation.findUniqueOrThrow({
        where: { id: data.allocationId },
      });

      // 2. Create the return record
      const returnRecord = await tx.assetReturn.create({
        data: {
          allocationId: data.allocationId,
          assetId: allocation.assetId,
          returnedBy: allocation.employeeId,
          receivedBy: receivedByEmployeeId,
          conditionNotes: data.conditionNotes,
          returnCondition: data.returnCondition,
        },
      });

      // 3. Mark allocation as returned
      await tx.assetAllocation.update({
        where: { id: data.allocationId },
        data: {
          status: AllocationStatus.returned,
          actualReturnDate: new Date(),
        },
      });

      // 4. Update the asset status (based on condition: good/fair -> available, damaged -> under_maintenance)
      const newStatus = data.returnCondition === 'damaged' ? AssetStatus.under_maintenance : AssetStatus.available;
      await tx.asset.update({
        where: { id: allocation.assetId },
        data: { status: newStatus },
      });

      // 5. Write status history log
      await tx.assetStatusHistory.create({
        data: {
          assetId: allocation.assetId,
          previousStatus: AssetStatus.allocated,
          newStatus,
          changedBy: receivedByEmployeeId,
          reason: `Asset returned. Condition: ${data.returnCondition}. Notes: ${data.conditionNotes || 'None'}`,
        },
      });

      return returnRecord;
    });
  }

  // --- Transfers logic ---

  public static async createTransferRequest(
    data: CreateTransferRequestInput,
    requestedByEmployeeId: string,
    fromEmployeeId: string,
    fromDepartmentId: string,
    toDepartmentId: string,
    assetId: string
  ): Promise<AssetTransferRequest> {
    return prisma.assetTransferRequest.create({
      data: {
        allocationId: data.allocationId,
        assetId,
        fromEmployeeId,
        toEmployeeId: data.toEmployeeId,
        fromDepartmentId,
        toDepartmentId,
        status: TransferRequestStatus.pending,
        requestedBy: requestedByEmployeeId,
        reason: data.reason,
      },
    });
  }

  public static async findTransferRequestById(id: string) {
    return prisma.assetTransferRequest.findUnique({
      where: { id },
      include: {
        allocation: true,
        asset: true,
        fromEmployee: true,
        toEmployee: true,
        fromDepartment: true,
        toDepartment: true,
        requester: true,
      },
    });
  }

  public static async updateTransferRequestStatus(
    id: string,
    status: TransferRequestStatus,
    approvedByEmployeeId: string
  ): Promise<AssetTransferRequest> {
    return prisma.$transaction(async (tx) => {
      const request = await tx.assetTransferRequest.update({
        where: { id },
        data: {
          status,
          approvedBy: approvedByEmployeeId,
          approvedAt: new Date(),
        },
      });

      // If approved and completed, execute actual transfer updates
      if (status === TransferRequestStatus.approved) {
        // Mark previous allocation as transferred
        await tx.assetAllocation.update({
          where: { id: request.allocationId },
          data: { status: AllocationStatus.transferred, actualReturnDate: new Date() },
        });

        // Create new allocation for target employee
        await tx.assetAllocation.create({
          data: {
            assetId: request.assetId,
            employeeId: request.toEmployeeId,
            departmentId: request.toDepartmentId,
            allocatedBy: approvedByEmployeeId,
            status: AllocationStatus.active,
            notes: `Transferred from employee ${request.fromEmployeeId}. Reason: ${request.reason}`,
          },
        });

        // Update the asset owner details
        await tx.asset.update({
          where: { id: request.assetId },
          data: {
            departmentId: request.toDepartmentId,
            status: AssetStatus.allocated,
          },
        });

        // Mark transfer as fully completed
        await tx.assetTransferRequest.update({
          where: { id },
          data: {
            status: TransferRequestStatus.completed,
            completedAt: new Date(),
          },
        });
      }

      return request;
    });
  }
}
export default AllocationRepository;
