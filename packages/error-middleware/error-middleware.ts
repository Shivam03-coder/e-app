import { Request, Response, NextFunction } from 'express';
import { AppError } from './error-classes';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    console.log(`[AppError] ${req.method} ${req.url} - ${err.message}`);
    return res.status(err.statusCode).json({
      status: err.isOperational ? 'failed' : 'error',
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }
  console.error(`[UnhandledError] ${req.method} ${req.url} -`, err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};
