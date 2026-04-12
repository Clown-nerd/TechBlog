import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
}

/**
 * Global error-handling middleware.  
 * Must be registered LAST (after all routes).
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  const statusCode = err.statusCode ?? 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Always log 5xx errors; include stack in both envs for server-side visibility
  if (statusCode >= 500) {
    logger.error(err.message, {
      statusCode,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
    });
  } else {
    logger.warn(err.message, { statusCode, method: req.method, url: req.originalUrl });
  }

  // Never leak internal error detail or stack traces to the client in production
  const clientMessage =
    isProduction && statusCode >= 500 ? 'Internal server error' : err.message;

  const responseBody: Record<string, unknown> = { error: clientMessage };

  // Expose stack trace in development only — aids local debugging
  if (!isProduction && err.stack) {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};

/** Convenience factory for typed HTTP errors */
export function createError(message: string, statusCode = 500): AppError {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  return err;
}
