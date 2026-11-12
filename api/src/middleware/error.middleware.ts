import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || (err instanceof ZodError ? 400 : 500);
  const message = err.message || 'Internal Server Error';

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.flatten().fieldErrors,
      },
    });
  }

  if (statusCode === 500 && env.NODE_ENV === 'production') {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong on our end',
      },
    });
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'ERROR',
      message,
      ...(err.details ? { details: err.details } : {}),
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
