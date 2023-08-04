import { Request, Response, NextFunction } from 'express';

const errorController = (err: any, req: Request, res: Response, next: NextFunction) => {
  const message = err.message || 'Something wrong...';
  const statusCode = err.statusCode || 500;
  const data = err.data;
  if (data) {
    return res.status(statusCode).json({ message, data, isError: true });
  }
  res.status(statusCode).json({ message, isError: true });
};

export default errorController;
