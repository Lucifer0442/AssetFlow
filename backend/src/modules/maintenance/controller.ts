import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from './service';
import { sendSuccess } from '../../utils/responseFormatter';
import { getPaginationOptions } from '../../utils/pagination';
import { MaintenanceStatus } from '@prisma/client';
import { getFileUrl } from '../../utils/fileUpload';
import { BadRequestError } from '../../errors/customErrors';

export class MaintenanceController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reporterEmployeeId = req.user?.userId;
      if (!reporterEmployeeId) {
        throw new BadRequestError('User context missing');
      }

      const ticket = await MaintenanceService.createRequest(req.body, reporterEmployeeId);
      sendSuccess(res, ticket, 'Maintenance request created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await MaintenanceService.getRequestById(req.params.id as string);
      sendSuccess(res, ticket);
    } catch (error) {
      next(error);
    }
  }

  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination = getPaginationOptions(req.query.page, req.query.limit);
      const status = req.query.status as MaintenanceStatus | undefined;
      const assetId = req.query.assetId as string | undefined;

      const tickets = await MaintenanceService.getAllRequests(pagination, status, assetId);
      sendSuccess(res, tickets);
    } catch (error) {
      next(error);
    }
  }

  public static async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deciderEmployeeId = req.user?.userId;
      if (!deciderEmployeeId) {
        throw new BadRequestError('User context missing');
      }

      const approval = await MaintenanceService.approveRequest(req.params.id as string, req.body, deciderEmployeeId);
      sendSuccess(res, approval, `Maintenance request has been ${req.body.action}ed successfully`);
    } catch (error) {
      next(error);
    }
  }

  public static async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignerEmployeeId = req.user?.userId;
      if (!assignerEmployeeId) {
        throw new BadRequestError('User context missing');
      }

      const assignment = await MaintenanceService.assignTechnician(req.params.id as string, req.body, assignerEmployeeId);
      sendSuccess(res, assignment, 'Technician assigned successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async startWork(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const technicianId = req.user?.userId;
      if (!technicianId) {
        throw new BadRequestError('User context missing');
      }

      await MaintenanceService.startWork(req.params.id as string, technicianId);
      sendSuccess(res, null, 'Work started on ticket successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async resolve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const technicianId = req.user?.userId;
      if (!technicianId) {
        throw new BadRequestError('User context missing');
      }

      const resolved = await MaintenanceService.resolveRequest(req.params.id as string, req.body, technicianId);
      sendSuccess(res, resolved, 'Ticket marked as resolved successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async close(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deciderEmployeeId = req.user?.userId;
      if (!deciderEmployeeId) {
        throw new BadRequestError('User context missing');
      }

      const closed = await MaintenanceService.closeRequest(req.params.id as string, deciderEmployeeId);
      sendSuccess(res, closed, 'Ticket closed successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async addAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new BadRequestError('No attachment file uploaded');
      }

      const fileUrl = getFileUrl(req.file.filename);
      const fileName = req.file.originalname;
      const fileType = req.file.mimetype;
      const fileSizeBytes = req.file.size;
      const employeeId = req.user?.userId;

      const attachment = await MaintenanceService.addAttachment(
        req.params.id as string,
        fileName,
        fileUrl,
        fileType,
        fileSizeBytes,
        employeeId
      );

      sendSuccess(res, attachment, 'Attachment uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}
export default MaintenanceController;
