import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Global error handler — must be registered LAST in Express
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log in dev
  if (config.isDev) {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  } else {
    console.error(`[ERROR] ${req.method} ${req.path}: ${message}`);
  }

  // Prisma-specific errors
  if (err.code === 'P2002') {
    res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
      code: 'DUPLICATE',
    });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'Record not found.',
      code: 'NOT_FOUND',
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.isDev && { stack: err.stack }),
  });
}

/**
 * Create a standardised app error
 */
export function createError(message: string, statusCode: number): AppError {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  return err;
}
