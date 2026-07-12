import { prisma } from '../../prisma/prisma';
import { MaintenanceRequest, MaintenanceApproval, MaintenanceAssignment, MaintenanceHistory, MaintenanceAttachment, MaintenanceStatus, AssetStatus, ApprovalAction } from '@prisma/client';
import { CreateMaintenanceInput, ApproveMaintenanceInput, AssignTechnicianInput, ResolveMaintenanceInput } from './types';
import { getSkipAndTake, PaginationParams } from '../../utils/pagination';

export class MaintenanceRepository {
  public static async create(data: CreateMaintenanceInput, reportedByEmployeeId: string): Promise<MaintenanceRequest> {
    return prisma.$transaction(async (tx) => {
      const code = `MNT-${Date.now()}`;
      const request = await tx.maintenanceRequest.create({
        data: {
          requestCode: code,
          assetId: data.assetId,
          reportedBy: reportedByEmployeeId,
          maintenanceType: data.maintenanceType,
          status: MaintenanceStatus.pending,
          priority: data.priority,
          title: data.title,
          description: data.description,
          estimatedCost: data.estimatedCost,
        },
      });

      // Write status history
      await tx.maintenanceHistory.create({
        data: {
          requestId: request.id,
          newStatus: MaintenanceStatus.pending,
          changedBy: reportedByEmployeeId,
          comments: 'Maintenance ticket created',
        },
      });

      return request;
    });
  }

  public static async findById(id: string) {
    return prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        asset: true,
        reporter: true,
        approvals: { include: { approver: true } },
        assignments: { include: { technician: true, assigner: true } },
        history: { include: { changer: true }, orderBy: { changedAt: 'desc' } },
        attachments: true,
      },
    });
  }

  public static async findAll(
    pagination: PaginationParams,
    status?: MaintenanceStatus,
    assetId?: string
  ): Promise<{ data: any[]; total: number }> {
    const { skip, take } = getSkipAndTake(pagination);

    const where: any = {};
    if (status) where.status = status;
    if (assetId) where.assetId = assetId;

    const [data, total] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where,
        skip,
        take,
        include: {
          asset: true,
          reporter: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.maintenanceRequest.count({ where }),
    ]);

    return { data, total };
  }

  public static async approve(
    id: string,
    data: ApproveMaintenanceInput,
    approvedByEmployeeId: string
  ): Promise<MaintenanceApproval> {
    return prisma.$transaction(async (tx) => {
      const approval = await tx.maintenanceApproval.create({
        data: {
          requestId: id,
          approvedBy: approvedByEmployeeId,
          action: data.action,
          comments: data.comments,
        },
      });

      const nextStatus = data.action === ApprovalAction.approved ? MaintenanceStatus.approved : MaintenanceStatus.rejected;
      
      // Update ticket status
      await tx.maintenanceRequest.update({
        where: { id },
        data: { status: nextStatus },
      });

      // Log status history
      await tx.maintenanceHistory.create({
        data: {
          requestId: id,
          previousStatus: MaintenanceStatus.pending,
          newStatus: nextStatus,
          changedBy: approvedByEmployeeId,
          comments: data.comments || `Ticket ${data.action}`,
        },
      });

      return approval;
    });
  }

  public static async assign(
    id: string,
    data: AssignTechnicianInput,
    assignedByEmployeeId: string
  ): Promise<MaintenanceAssignment> {
    return prisma.$transaction(async (tx) => {
      // 1. Create the technician assignment record
      const assignment = await tx.maintenanceAssignment.create({
        data: {
          requestId: id,
          technicianId: data.technicianId,
          assignedBy: assignedByEmployeeId,
          notes: data.notes,
        },
      });

      // 2. Update status of request to assigned
      await tx.maintenanceRequest.update({
        where: { id },
        data: { status: MaintenanceStatus.technician_assigned },
      });

      // 3. Log history
      await tx.maintenanceHistory.create({
        data: {
          requestId: id,
          previousStatus: MaintenanceStatus.approved,
          newStatus: MaintenanceStatus.technician_assigned,
          changedBy: assignedByEmployeeId,
          comments: `Technician assigned. Notes: ${data.notes || 'None'}`,
        },
      });

      return assignment;
    });
  }

  public static async startWork(id: string, technicianId: string): Promise<void> {
    return prisma.$transaction(async (tx) => {
      const ticket = await tx.maintenanceRequest.findUniqueOrThrow({ where: { id } });

      // Update request status and log work start
      await tx.maintenanceRequest.update({
        where: { id },
        data: { status: MaintenanceStatus.in_progress },
      });

      // Log assignment start timestamp
      await tx.maintenanceAssignment.updateMany({
        where: { requestId: id, technicianId, startedAt: null },
        data: { startedAt: new Date() },
      });

      // Update asset status to under_maintenance
      await tx.asset.update({
        where: { id: ticket.assetId },
        data: { status: AssetStatus.under_maintenance },
      });

      await tx.maintenanceHistory.create({
        data: {
          requestId: id,
          previousStatus: ticket.status,
          newStatus: MaintenanceStatus.in_progress,
          changedBy: technicianId,
          comments: 'Maintenance work started',
        },
      });

      // Write status history log for the asset
      await tx.assetStatusHistory.create({
        data: {
          assetId: ticket.assetId,
          previousStatus: AssetStatus.available, // assuming it was available
          newStatus: AssetStatus.under_maintenance,
          changedBy: technicianId,
          reason: 'Asset went into repairs/maintenance process',
        },
      });
    });
  }

  public static async resolve(
    id: string,
    data: ResolveMaintenanceInput,
    technicianId: string
  ): Promise<MaintenanceRequest> {
    return prisma.$transaction(async (tx) => {
      const ticket = await tx.maintenanceRequest.findUniqueOrThrow({ where: { id } });

      const updated = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status: MaintenanceStatus.resolved,
          resolutionNotes: data.resolutionNotes,
          actualCost: data.actualCost,
          resolvedAt: new Date(),
        },
      });

      // Log assignment completion timestamp
      await tx.maintenanceAssignment.updateMany({
        where: { requestId: id, technicianId, completedAt: null },
        data: { completedAt: new Date() },
      });

      // Update asset status back to available
      await tx.asset.update({
        where: { id: ticket.assetId },
        data: { status: AssetStatus.available },
      });

      await tx.maintenanceHistory.create({
        data: {
          requestId: id,
          previousStatus: ticket.status,
          newStatus: MaintenanceStatus.resolved,
          changedBy: technicianId,
          comments: `Maintenance resolved. Notes: ${data.resolutionNotes}`,
        },
      });

      // Write asset status log
      await tx.assetStatusHistory.create({
        data: {
          assetId: ticket.assetId,
          previousStatus: AssetStatus.under_maintenance,
          newStatus: AssetStatus.available,
          changedBy: technicianId,
          reason: `Asset repairs completed: ${data.resolutionNotes}`,
        },
      });

      return updated;
    });
  }

  public static async close(id: string, closedByEmployeeId: string): Promise<MaintenanceRequest> {
    return prisma.$transaction(async (tx) => {
      const ticket = await tx.maintenanceRequest.findUniqueOrThrow({ where: { id } });

      const updated = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status: MaintenanceStatus.closed,
          closedAt: new Date(),
        },
      });

      await tx.maintenanceHistory.create({
        data: {
          requestId: id,
          previousStatus: ticket.status,
          newStatus: MaintenanceStatus.closed,
          changedBy: closedByEmployeeId,
          comments: 'Maintenance ticket closed',
        },
      });

      return updated;
    });
  }

  // --- Attachments ---

  public static async addAttachment(
    requestId: string,
    fileName: string,
    fileUrl: string,
    fileType?: string,
    fileSizeBytes?: number,
    uploadedByEmployeeId?: string
  ): Promise<MaintenanceAttachment> {
    return prisma.maintenanceAttachment.create({
      data: {
        requestId,
        fileName,
        fileUrl,
        fileType,
        fileSizeBytes,
        uploadedBy: uploadedByEmployeeId,
      },
    });
  }
}
export default MaintenanceRepository;
