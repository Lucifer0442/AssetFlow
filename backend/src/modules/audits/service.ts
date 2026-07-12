import { AuditRepository } from './repository';
import { CreateAuditCycleInput, CreateAuditAssignmentInput, VerifyAuditItemInput, ResolveDiscrepancyInput } from './types';
import { ConflictError, NotFoundError, BadRequestError } from '../../errors/customErrors';
import { EmployeeRepository } from '../employees/repository';
import { DepartmentRepository } from '../departments/repository';
import { AuditCycleStatus, AuditResult } from '@prisma/client';
import { socketBroadcaster } from '../../socket/socketEvents';
import { socketEvents } from '../../config/socket';

export class AuditService {
  // --- Cycles ---

  public static async createCycle(data: CreateAuditCycleInput, employeeId: string) {
    const existing = await AuditRepository.findCycleByCode(data.cycleCode);
    if (existing) {
      throw new ConflictError(`Audit cycle with code ${data.cycleCode} already exists`);
    }

    return AuditRepository.createCycle(data, employeeId);
  }

  public static async getCycleById(id: string) {
    const cycle = await AuditRepository.findCycleById(id);
    if (!cycle) {
      throw new NotFoundError('Audit cycle not found');
    }
    return cycle;
  }

  public static async getAllCycles() {
    return AuditRepository.findAllCycles();
  }

  public static async lockCycle(id: string) {
    const cycle = await AuditRepository.findCycleById(id);
    if (!cycle) {
      throw new NotFoundError('Audit cycle not found');
    }

    if (cycle.status === AuditCycleStatus.closed) {
      throw new BadRequestError('Audit cycle is already locked/closed');
    }

    return AuditRepository.updateCycleStatus(id, AuditCycleStatus.closed);
  }

  // --- Assignments & Items ---

  public static async assignAuditor(data: CreateAuditAssignmentInput) {
    // 1. Verify cycle is open
    const cycle = await AuditRepository.findCycleById(data.auditCycleId);
    if (!cycle || cycle.status === AuditCycleStatus.closed) {
      throw new BadRequestError('Audit cycle not found or is closed/locked');
    }

    // 2. Verify auditor exists and has the Auditor role
    const auditor = await EmployeeRepository.findById(data.auditorId);
    if (!auditor || auditor.status !== 'active') {
      throw new BadRequestError('Target auditor employee not found or is inactive');
    }

    // 3. Verify department exists
    const dept = await DepartmentRepository.findById(data.departmentId);
    if (!dept) {
      throw new NotFoundError('Target department not found');
    }

    const assignment = await AuditRepository.assignAuditor(data);

    // Emit live event
    socketBroadcaster.notifyUser(data.auditorId, {
      title: 'New Audit Assignment',
      message: `You have been assigned to audit the ${dept.name} department for cycle ${cycle.name}.`,
    });

    return assignment;
  }

  public static async getAssignmentById(id: string) {
    const assignment = await AuditRepository.findAssignmentById(id);
    if (!assignment) {
      throw new NotFoundError('Audit assignment not found');
    }
    return assignment;
  }

  public static async verifyItem(itemId: string, data: VerifyAuditItemInput, auditorEmployeeId: string) {
    const item = await prisma.auditItem.findUnique({
      where: { id: itemId },
      include: {
        auditAssignment: {
          include: { auditCycle: true },
        },
      },
    });

    if (!item) {
      throw new NotFoundError('Audit item not found');
    }

    if (item.auditAssignment.auditCycle.status === AuditCycleStatus.closed) {
      throw new BadRequestError('Cannot perform audit verification on locked/closed audit cycle');
    }

    if (item.auditAssignment.auditorId !== auditorEmployeeId) {
      throw new ForbiddenError('You are not the assigned auditor for this verification item');
    }

    const updatedItem = await AuditRepository.verifyItem(itemId, data, auditorEmployeeId);

    // If discrepancy alert
    if (data.result === AuditResult.missing || data.result === AuditResult.damaged) {
      socketBroadcaster.notifyRole('admin', socketEvents.AUDIT.DISCREPANCY_FOUND, {
        itemId,
        result: data.result,
        conditionNotes: data.conditionNotes,
      });
    }

    return updatedItem;
  }

  // --- Discrepancies ---

  public static async resolveDiscrepancy(discrepancyId: string, data: ResolveDiscrepancyInput, employeeId: string) {
    const discrepancy = await prisma.discrepancyReport.findUnique({
      where: { id: discrepancyId },
    });

    if (!discrepancy) {
      throw new NotFoundError('Discrepancy report not found');
    }

    if (discrepancy.isResolved) {
      throw new BadRequestError('Discrepancy report already marked as resolved');
    }

    return AuditRepository.resolveDiscrepancy(discrepancyId, data, employeeId);
  }
}
import { prisma } from '../../prisma/prisma';
import { ForbiddenError } from '../../errors/customErrors';
export default AuditService;
