import { NextFunction, Request, Response } from 'express';

export const AsyncHandler = (
  asyncFunction: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await asyncFunction(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

// utils/ApiResponse.ts

export class ApiResponse<T = any> {
  public success: boolean;
  public message: string;
  public data?: T;

  constructor(message: string, data?: T, success = true) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}
