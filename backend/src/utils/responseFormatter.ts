import { Response } from 'express';

export interface ApiResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  data?: T;
}

export function sendSuccess<T = any>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response {
  const payload: ApiResponse<T> = {
    status: 'success',
    data,
  };
  if (message) {
    payload.message = message;
  }
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors: any[] | null = null
): Response {
  const payload: any = {
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
  };
  if (errors) {
    payload.errors = errors;
  }
  return res.status(statusCode).json(payload);
}
