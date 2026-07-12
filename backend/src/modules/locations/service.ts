import { LocationRepository } from './repository';
import { CreateLocationInput, UpdateLocationInput } from './types';
import { ConflictError, NotFoundError, BadRequestError } from '../../errors/customErrors';

export class LocationService {
  public static async createLocation(data: CreateLocationInput) {
    const existing = await LocationRepository.findByCode(data.code);
    if (existing) {
      throw new ConflictError(`Location code ${data.code} already exists`);
    }

    return LocationRepository.create(data);
  }

  public static async getLocationById(id: string) {
    const location = await LocationRepository.findById(id);
    if (!location) {
      throw new NotFoundError('Location not found');
    }
    return location;
  }

  public static async getAllLocations(search?: string) {
    return LocationRepository.findAll(search);
  }

  public static async updateLocation(id: string, data: UpdateLocationInput) {
    const location = await LocationRepository.findById(id);
    if (!location) {
      throw new NotFoundError('Location not found');
    }

    return LocationRepository.update(id, data);
  }

  public static async deleteLocation(id: string): Promise<void> {
    const location = await LocationRepository.findById(id);
    if (!location) {
      throw new NotFoundError('Location not found');
    }

    // Verify relations so we do not break integrity
    if (location.employees.length > 0) {
      throw new BadRequestError('Cannot delete location linked to employee profiles');
    }
    if (location.assets.length > 0) {
      throw new BadRequestError('Cannot delete location linked to active assets');
    }
    if (location.resources.length > 0) {
      throw new BadRequestError('Cannot delete location linked to bookable resources');
    }

    await LocationRepository.delete(id);
  }
}
export default LocationService;
