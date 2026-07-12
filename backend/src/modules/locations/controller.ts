import { Request, Response, NextFunction } from 'express';
import { LocationService } from './service';
import { sendSuccess } from '../../utils/responseFormatter';

export class LocationController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const location = await LocationService.createLocation(req.body);
      sendSuccess(res, location, 'Location created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const location = await LocationService.getLocationById(req.params.id as string);
      sendSuccess(res, location);
    } catch (error) {
      next(error);
    }
  }

  public static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const locations = await LocationService.getAllLocations(search);
      sendSuccess(res, locations);
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const location = await LocationService.updateLocation(req.params.id as string, req.body);
      sendSuccess(res, location, 'Location updated successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await LocationService.deleteLocation(req.params.id as string);
      sendSuccess(res, null, 'Location deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
export default LocationController;
