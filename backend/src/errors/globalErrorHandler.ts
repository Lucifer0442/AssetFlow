import { Request, Response, NextFunction } from 'express';
import { AppError } from './customErrors';
import logger from '../config/logger';
import env from '../config/env';
import { Prisma } from '@prisma/client';

export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log the raw error stack
  logger.error(`💥 Error occurred: ${err.message}`, { stack: err.stack });

  // Handle Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation (e.g., duplicate email)
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      error = new AppError(`Duplicate value for: ${target}`, 409);
    }
    // Foreign key constraint failed
    else if (err.code === 'P2003') {
      error = new AppError(`Invalid reference: Foreign key constraint failed.`, 400);
    }
    // Record not found
    else if (err.code === 'P2025') {
      error = new AppError(err.meta?.cause as string || 'Record not found.', 404);
    }
  }

  // Fallback status code and message
  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';
  const message = error.message || 'Internal Server Error';
  const errors = error.errors || null;

  const responsePayload: any = {
    status,
    message,
  };

  if (errors) {
    responsePayload.errors = errors;
  }

  if (env.NODE_ENV === 'development') {
    responsePayload.stack = error.stack;
  }

  res.status(statusCode).json(responsePayload);
}

export default globalErrorHandler;
