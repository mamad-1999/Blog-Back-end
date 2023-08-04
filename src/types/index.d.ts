import mongoose from 'mongoose';

declare global {
  namespace Express {
    export interface Request {
      user?: mongoose.Types.ObjectId;
    }
  }
}
export {};
