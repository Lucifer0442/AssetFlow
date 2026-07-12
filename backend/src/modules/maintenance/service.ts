import { MaintenanceRepository } from './repository';
import { CreateMaintenanceInput, ApproveMaintenanceInput, AssignTechnicianInput, ResolveMaintenanceInput } from './types';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../errors/customErrors';
import { AssetRepository } from '../assets/repository';
import { EmployeeRepository } from '../employees/repository';
import { PaginationParams, formatPaginatedResponse } from '../../utils/pagination';
import { MaintenanceStatus, AssetStatus, ApprovalAction } from '@prisma/client';
import { socketBroadcaster } from '../../socket/socketEvents';
import { socketEvents } from '../../config/socket';

export class MaintenanceService {
  public static async createRequest(data: CreateMaintenanceInput, employeeId: string) {
    const asset = await AssetRepository.findById(data.assetId);
    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    if (asset.status === AssetStatus.retired || asset.status === AssetStatus.disposed) {
      throw new BadRequestError('Cannot file maintenance for retired or disposed assets');
    }

    return MaintenanceRepository.create(data, employeeId);
  }

  public static async getRequestById(id: string) {
    const ticket = await MaintenanceRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError('Maintenance ticket not found');
    }
    return ticket;
  }

  public static async getAllRequests(pagination: PaginationParams, status?: MaintenanceStatus, assetId?: string) {
    const { data, total } = await MaintenanceRepository.findAll(pagination, status, assetId);
    return formatPaginatedResponse(data, total, pagination);
  }

  public static async approveRequest(id: string, data: ApproveMaintenanceInput, employeeId: string) {
    const ticket = await MaintenanceRepository.findById(id);
    if (!ticket || ticket.status !== MaintenanceStatus.pending) {
      throw new BadRequestError('Maintenance ticket not found or not in pending state');
    }

    const approval = await MaintenanceRepository.approve(id, data, employeeId);

    // Emit live updates
    socketBroadcaster.notifyUser(ticket.reportedBy, {
      title: `Maintenance Request ${data.action.toUpperCase()}`,
      message: `Your maintenance request for asset ${ticket.asset.name} has been ${data.action}.`,
    });

    return approval;
  }

  public static async assignTechnician(id: string, data: AssignTechnicianInput, employeeId: string) {
    const ticket = await MaintenanceRepository.findById(id);
    if (!ticket || ticket.status !== MaintenanceStatus.approved) {
      throw new BadRequestError('Maintenance ticket not approved or already assigned');
    }

    const tech = await EmployeeRepository.findById(data.technicianId);
    if (!tech || tech.status !== 'active') {
      throw new BadRequestError('Technician not found or inactive');
    }

    const assignment = await MaintenanceRepository.assign(id, data, employeeId);

    // Emit socket alert to assigned technician
    socketBroadcaster.notifyUser(data.technicianId, {
      title: 'New Maintenance Assignment',
      message: `You have been assigned to maintenance ticket ${ticket.requestCode} for asset ${ticket.asset.name}.`,
    });

    return assignment;
  }

  public static async startWork(id: string, technicianId: string) {
    const ticket = await MaintenanceRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError('Maintenance ticket not found');
    }

    if (ticket.status !== MaintenanceStatus.technician_assigned) {
      throw new BadRequestError('Cannot start work unless technician is assigned');
    }

    // Verify requesting technician matches assigned technician
    const isAssigned = ticket.assignments.some(
      (a: any) => a.technicianId === technicianId && a.startedAt === null
    );

    if (!isAssigned) {
      throw new ForbiddenError('You are not assigned to start work on this ticket');
    }

    await MaintenanceRepository.startWork(id, technicianId);
  }

  public static async resolveRequest(id: string, data: ResolveMaintenanceInput, technicianId: string) {
    const ticket = await MaintenanceRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError('Maintenance ticket not found');
    }

    if (ticket.status !== MaintenanceStatus.in_progress) {
      throw new BadRequestError('Cannot resolve ticket unless work is in progress');
    }

    const isAssigned = ticket.assignments.some(
      (a: any) => a.technicianId === technicianId && a.completedAt === null
    );

    if (!isAssigned) {
      throw new ForbiddenError('You are not authorized to resolve this ticket');
    }

    const resolved = await MaintenanceRepository.resolve(id, data, technicianId);

    // Alert reporter
    socketBroadcaster.notifyUser(ticket.reportedBy, {
      title: 'Maintenance Ticket Resolved',
      message: `Maintenance request ${ticket.requestCode} for asset ${ticket.asset.name} has been resolved.`,
    });

    return resolved;
  }

  public static async closeRequest(id: string, employeeId: string) {
    const ticket = await MaintenanceRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError('Maintenance ticket not found');
    }

    if (ticket.status !== MaintenanceStatus.resolved) {
      throw new BadRequestError('Only resolved maintenance tickets can be closed');
    }

    return MaintenanceRepository.close(id, employeeId);
  }

  public static async addAttachment(
    id: string,
    fileName: string,
    fileUrl: string,
    fileType?: string,
    fileSizeBytes?: number,
    employeeId?: string
  ) {
    const ticket = await MaintenanceRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError('Maintenance ticket not found');
    }

    return MaintenanceRepository.addAttachment(id, fileName, fileUrl, fileType, fileSizeBytes, employeeId);
  }
}
export default MaintenanceService;
