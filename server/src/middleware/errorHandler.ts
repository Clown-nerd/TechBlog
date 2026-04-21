import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  constraint?: string;
  detail?: string;
}

interface StandardizedErrorResponse {
  error: string;
  type: string;
  details?: unknown;
  stack?: string;
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
  let statusCode = err.statusCode ?? 500;
  const isProduction = process.env.NODE_ENV === 'production';
  let clientMessage = err.message;
  let errorType = 'SERVER_ERROR';
  let errorDetails: unknown = undefined;

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    clientMessage = 'Validation failed';
    errorType = 'VALIDATION_ERROR';
    errorDetails = err.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message
    }));
  } 
  // 2. PostgreSQL DB Errors
  else if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        statusCode = 409;
        clientMessage = 'A record with that information already exists.';
        errorType = 'DATABASE_ERROR';
        break;
      case '23503': // foreign_key_violation
        statusCode = 400;
        clientMessage = 'Referenced record does not exist.';
        errorType = 'DATABASE_ERROR';
        break;
      case '22P02': // invalid_text_representation
        statusCode = 400;
        clientMessage = 'Invalid input format for database operation.';
        errorType = 'DATABASE_ERROR';
        break;
      case '08000': // connection_exception
      case '08003': // connection_does_not_exist
      case '08006': // connection_failure
        statusCode = 503;
        clientMessage = 'Service unavailable. Database connection failed.';
        errorType = 'DATABASE_ERROR';
        break;
      default:
        // Handle generic pg errors
        if (err.code && err.code.length === 5) {
          statusCode = 500;
          clientMessage = 'Database error occurred.';
          errorType = 'DATABASE_ERROR';
        }
    }
  } 
  // 3. AppError or General Exceptions
  else {
    errorType = statusCode >= 500 ? 'SERVER_ERROR' : 'HTTP_ERROR';
    if (isProduction && statusCode >= 500) {
      clientMessage = 'Internal server error';
    }
  }

  // Always log 5xx errors; include stack in both envs for server-side visibility
  if (statusCode >= 500) {
    logger.error(err.message || 'Internal error', {
      statusCode,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      code: err.code,
      details: errorDetails
    });
  } else {
    logger.warn(err.message || 'Warning', { 
      statusCode, 
      method: req.method, 
      url: req.originalUrl,
      code: err.code,
      details: errorDetails
    });
  }

  const responseBody: StandardizedErrorResponse = { 
    error: clientMessage,
    type: errorType,
  };

  if (errorDetails) {
    responseBody.details = errorDetails;
  }

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
