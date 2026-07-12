import { AllocationRepository } from './repository';
import { CreateAllocationInput, ReturnAssetInput, CreateTransferRequestInput } from './types';
import { BadRequestError, NotFoundError, ConflictError } from '../../errors/customErrors';
import { AssetRepository } from '../assets/repository';
import { EmployeeRepository } from '../employees/repository';
import { PaginationParams, formatPaginatedResponse } from '../../utils/pagination';
import { AssetStatus, TransferRequestStatus } from '@prisma/client';
import EmailService from '../../utils/email';

export class AllocationService {
  public static async allocateAsset(data: CreateAllocationInput, allocatedByEmployeeId: string) {
    // 1. Verify asset exists and is available
    const asset = await AssetRepository.findById(data.assetId);
    if (!asset) {
      throw new NotFoundError('Asset not found');
    }
    if (asset.status !== AssetStatus.available) {
      throw new ConflictError(`Asset is currently not available for allocation. Current status: ${asset.status}`);
    }

    // 2. Verify target employee exists and is active
    const employee = await EmployeeRepository.findById(data.employeeId);
    if (!employee || employee.status !== 'active') {
      throw new BadRequestError('Target employee is not found or is inactive');
    }

    const departmentId = employee.departmentId;
    if (!departmentId) {
      throw new BadRequestError('Employee must belong to a department before receiving allocations');
    }

    // 3. Create allocation
    const allocation = await AllocationRepository.create(data, allocatedByEmployeeId, departmentId);

    // 4. Send email notification
    await EmailService.sendAssetAllocationEmail(
      employee.email,
      `${employee.firstName} ${employee.lastName}`,
      asset.name,
      asset.assetCode
    );

    return allocation;
  }

  public static async getAllAllocations(pagination: PaginationParams, employeeId?: string, status?: any) {
    const { data, total } = await AllocationRepository.findAll(pagination, employeeId, status);
    return formatPaginatedResponse(data, total, pagination);
  }

  public static async getAllocationById(id: string) {
    const allocation = await AllocationRepository.findById(id);
    if (!allocation) {
      throw new NotFoundError('Allocation record not found');
    }
    return allocation;
  }

  public static async returnAsset(data: ReturnAssetInput, receivedByEmployeeId: string) {
    const allocation = await AllocationRepository.findById(data.allocationId);
    if (!allocation || allocation.status !== 'active') {
      throw new BadRequestError('Active allocation record not found for this return operation');
    }

    return AllocationRepository.return(data, receivedByEmployeeId);
  }

  public static async createTransferRequest(data: CreateTransferRequestInput, requestedByEmployeeId: string) {
    // 1. Verify active allocation exists
    const allocation = await AllocationRepository.findById(data.allocationId);
    if (!allocation || allocation.status !== 'active') {
      throw new BadRequestError('Active allocation record not found');
    }

    // 2. Verify target employee exists and is active
    const targetEmployee = await EmployeeRepository.findById(data.toEmployeeId);
    if (!targetEmployee || targetEmployee.status !== 'active') {
      throw new BadRequestError('Target transfer employee not found or inactive');
    }

    if (!targetEmployee.departmentId) {
      throw new BadRequestError('Target employee must belong to a department');
    }

    if (allocation.employeeId === data.toEmployeeId) {
      throw new BadRequestError('Cannot transfer an asset to the same employee who currently owns it');
    }

    return AllocationRepository.createTransferRequest(
      data,
      requestedByEmployeeId,
      allocation.employeeId,
      allocation.departmentId,
      targetEmployee.departmentId,
      allocation.assetId
    );
  }

  public static async handleTransferRequest(id: string, action: 'approve' | 'reject', deciderEmployeeId: string) {
    const request = await AllocationRepository.findTransferRequestById(id);
    if (!request || request.status !== TransferRequestStatus.pending) {
      throw new BadRequestError('Pending transfer request not found');
    }

    const status = action === 'approve' ? TransferRequestStatus.approved : TransferRequestStatus.rejected;
    return AllocationRepository.updateTransferRequestStatus(id, status, deciderEmployeeId);
  }
}
export default AllocationService;
