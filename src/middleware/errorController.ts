import { Request, Response } from 'express';
import { CustomError } from '../types/error';

const errorController = (err: CustomError, req: Request, res: Response) => {
  const message = err.message || 'Something wrong...';
  const statusCode = err.statusCode || 500;
  const data = err.data;
  if (data) {
    return res.status(statusCode).json({ message, data, isError: true });
  }
  res.status(statusCode).json({ message, isError: true });
};

export default errorController;
