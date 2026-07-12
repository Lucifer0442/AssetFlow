import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors/customErrors';

export function notFoundMiddleware(req: Request, res: Response, next: NextFunction): void {
  const error = new NotFoundError(`Method ${req.method} for path ${req.originalUrl} not found`);
  next(error);
}

export default notFoundMiddleware;
