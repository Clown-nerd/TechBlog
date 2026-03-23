import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validates req.body against a Zod schema and attaches the parsed
 * result to req.body (coerced types stay correct).
 */
export const validateBody =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation error',
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };

/**
 * Validates req.query against a Zod schema and attaches the parsed
 * result to req.query.
 */
export const validateQuery =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation error',
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    (req as any).validatedQuery = result.data;
    next();
  };
