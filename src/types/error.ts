import { ValidationError } from 'fastest-validator';

export interface CustomError extends Error {
  statusCode: number;
  data?: ValidationError[];
}
