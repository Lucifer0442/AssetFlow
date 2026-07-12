import { AuditResult, AuditCycleStatus } from '@prisma/client';

export interface CreateAuditCycleInput {
  cycleCode: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
}

export interface CreateAuditAssignmentInput {
  auditCycleId: string;
  auditorId: string;
  departmentId: string;
}

export interface VerifyAuditItemInput {
  result: AuditResult;
  conditionNotes?: string;
  locationVerified: boolean;
}

export interface ResolveDiscrepancyInput {
  resolution: string;
}
