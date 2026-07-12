import { DepartmentStatus } from '@prisma/client';

export interface CreateDepartmentInput {
  name: string;
  code: string;
  description?: string;
  parentDepartmentId?: string;
  headEmployeeId?: string;
}

export interface UpdateDepartmentInput {
  name?: string;
  description?: string;
  parentDepartmentId?: string;
  headEmployeeId?: string;
  status?: DepartmentStatus;
}
