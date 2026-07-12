import { prisma } from '../../prisma/prisma';
import { AuditCycle, AuditAssignment, AuditItem, DiscrepancyReport, AuditCycleStatus, AuditResult, AssetStatus } from '@prisma/client';
import { CreateAuditCycleInput, CreateAuditAssignmentInput, VerifyAuditItemInput, ResolveDiscrepancyInput } from './types';
import { getSkipAndTake, PaginationParams } from '../../utils/pagination';

export class AuditRepository {
  // --- Cycle CRUD ---

  public static async createCycle(data: CreateAuditCycleInput, createdByEmployeeId: string): Promise<AuditCycle> {
    return prisma.auditCycle.create({
      data: {
        cycleCode: data.cycleCode,
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        createdBy: createdByEmployeeId,
        status: AuditCycleStatus.planned,
      },
    });
  }

  public static async findCycleById(id: string): Promise<AuditCycle | null> {
    return prisma.auditCycle.findUnique({
      where: { id },
      include: {
        creator: true,
        assignments: {
          include: {
            auditor: true,
            department: true,
            items: true,
          },
        },
      },
    });
  }

  public static async findCycleByCode(cycleCode: string): Promise<AuditCycle | null> {
    return prisma.auditCycle.findUnique({
      where: { cycleCode },
    });
  }

  public static async findAllCycles(): Promise<AuditCycle[]> {
    return prisma.auditCycle.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async updateCycleStatus(id: string, status: AuditCycleStatus): Promise<AuditCycle> {
    const closedAt = status === AuditCycleStatus.closed ? new Date() : undefined;
    return prisma.auditCycle.update({
      where: { id },
      data: {
        status,
        closedAt,
      },
    });
  }

  // --- Assignments & Item Audits ---

  public static async assignAuditor(data: CreateAuditAssignmentInput): Promise<AuditAssignment> {
    return prisma.$transaction(async (tx) => {
      // 1. Create the auditor assignment
      const assignment = await tx.auditAssignment.create({
        data: {
          auditCycleId: data.auditCycleId,
          auditorId: data.auditorId,
          departmentId: data.departmentId,
        },
      });

      // 2. Fetch all active/allocated assets belonging to this department
      const assets = await tx.asset.findMany({
        where: {
          departmentId: data.departmentId,
          status: {
            in: [AssetStatus.available, AssetStatus.allocated, AssetStatus.reserved, AssetStatus.under_maintenance],
          },
        },
      });

      // 3. Auto-populate audit_items for all these assets
      if (assets.length > 0) {
        await tx.auditItem.createMany({
          data: assets.map((asset) => ({
            auditAssignmentId: assignment.id,
            assetId: asset.id,
          })),
        });
      }

      // Update cycle status to in_progress on first assignment
      await tx.auditCycle.update({
        where: { id: data.auditCycleId },
        data: { status: AuditCycleStatus.in_progress },
      });

      return tx.auditAssignment.findUniqueOrThrow({
        where: { id: assignment.id },
        include: { items: true },
      });
    });
  }

  public static async findAssignmentById(id: string) {
    return prisma.auditAssignment.findUnique({
      where: { id },
      include: {
        auditCycle: true,
        auditor: true,
        department: true,
        items: {
          include: { asset: true, discrepancies: true },
        },
      },
    });
  }

  public static async verifyItem(
    itemId: string,
    data: VerifyAuditItemInput,
    auditorId: string
  ): Promise<AuditItem> {
    return prisma.$transaction(async (tx) => {
      const item = await tx.auditItem.update({
        where: { id: itemId },
        data: {
          result: data.result,
          conditionNotes: data.conditionNotes,
          locationVerified: data.locationVerified,
          auditedAt: new Date(),
        },
        include: { asset: true },
      });

      // If missing or damaged, automatically generate discrepancy report
      if (data.result === AuditResult.missing || data.result === AuditResult.damaged) {
        await tx.discrepancyReport.create({
          data: {
            auditItemId: itemId,
            discrepancyType: data.result === AuditResult.missing ? 'missing' : 'damaged',
            description: `Audit verification failed. Result: ${data.result}. Condition notes: ${data.conditionNotes || 'None'}. Location verified: ${data.locationVerified}`,
            recommendedAction: data.result === AuditResult.missing ? 'Request security search / write-off' : 'Initiate maintenance work ticket',
          },
        });

        // Also update Asset status to match
        const newAssetStatus = data.result === AuditResult.missing ? AssetStatus.lost : AssetStatus.under_maintenance;
        await tx.asset.update({
          where: { id: item.assetId },
          data: { status: newAssetStatus },
        });

        // Log status change
        await tx.assetStatusHistory.create({
          data: {
            assetId: item.assetId,
            previousStatus: item.asset.status,
            newStatus: newAssetStatus,
            changedBy: auditorId,
            reason: `Asset audit result was ${data.result}. Discrepancy logged.`,
          },
        });
      }

      return item;
    });
  }

  // --- Discrepancies ---

  public static async resolveDiscrepancy(
    discrepancyId: string,
    data: ResolveDiscrepancyInput,
    resolvedByEmployeeId: string
  ): Promise<DiscrepancyReport> {
    return prisma.discrepancyReport.update({
      where: { id: discrepancyId },
      data: {
        isResolved: true,
        resolution: data.resolution,
        resolvedBy: resolvedByEmployeeId,
        resolvedAt: new Date(),
      },
    });
  }
}
export default AuditRepository;
