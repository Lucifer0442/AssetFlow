import { EmployeeStatus } from '@prisma/client';

export interface CreateEmployeeInput {
  userId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  designation?: string;
  departmentId?: string;
  locationId?: string;
  status?: EmployeeStatus;
  dateOfJoining?: Date;
  avatarUrl?: string;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  designation?: string;
  departmentId?: string;
  locationId?: string;
  status?: EmployeeStatus;
  dateOfJoining?: Date;
  avatarUrl?: string;
}
