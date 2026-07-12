import { Request, Response, NextFunction } from 'express';
import upload from '../config/upload';
import { BadRequestError } from '../errors/customErrors';

export function uploadSingle(fieldname: string) {
  const uploadHandler = upload.single(fieldname);

  return (req: Request, res: Response, next: NextFunction): void => {
    uploadHandler(req, res, (err: any) => {
      if (err) {
        next(new BadRequestError(err.message || 'File upload failed'));
      } else {
        next();
      }
    });
  };
}

export function uploadArray(fieldname: string, maxCount = 5) {
  const uploadHandler = upload.array(fieldname, maxCount);

  return (req: Request, res: Response, next: NextFunction): void => {
    uploadHandler(req, res, (err: any) => {
      if (err) {
        next(new BadRequestError(err.message || 'File upload failed'));
      } else {
        next();
      }
    });
  };
}
