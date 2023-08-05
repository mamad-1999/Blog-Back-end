import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import errorHandler from '../utils/errorHandler';
import mongoose from 'mongoose';
import env from '../utils/env';

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeader =
    req.headers.authorization || (req.headers.Authorization as string);

  if (!authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authorizationHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as {
      _id: mongoose.Types.ObjectId;
    };
    if (!decoded || !decoded._id) {
      errorHandler('Forbidden', 403);
    }
    req.user = decoded._id;
    next();
  } catch (error) {
    next(error);
  }
};

export default verifyJWT;
