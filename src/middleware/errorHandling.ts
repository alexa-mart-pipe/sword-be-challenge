import { NextFunction, Request, Response } from 'express';

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.status(500).json({
    message: 'A problem has occurred. Please try again.',
    errorName: err.name,
    errorMessage: err.message,
  });
}

export default errorHandler;
