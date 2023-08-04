import allowOrigins from '../configs/allowOrigins';

import { Request, Response, NextFunction } from 'express';

const credential = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || '';
  if (!allowOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Credentials', origin);
  }
  next();
};

export default credential;
