import { CustomError } from '../types/error';
import { ValidationError } from 'fastest-validator';

const errorHandler = (
  message: string,
  statusCode: number = 500,
  data?: ValidationError[],
) => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  if (data) error.data = data;

  throw error;
};

export default errorHandler;
