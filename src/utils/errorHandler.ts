import { CustomError } from '../types/error';

const errorHandler = (message: string, statusCode: number = 500, data?: any[]) => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  if (data) error.data = data;

  throw error;
};

export default errorHandler;
