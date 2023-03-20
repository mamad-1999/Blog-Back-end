import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

const handleMulterError = (
  err: Error | multer.MulterError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds the limit (6MB)' });
    }
  } else if (err) {
    // Other error occurred, handle it here
    res.status(500).json({ message: 'Internal server error', error: err.message });
  } else {
    next();
  }
};

export default handleMulterError;
