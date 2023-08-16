import { NextFunction, Request, Response } from 'express';
import fileDelete from '../utils/fileDeleter';

const deleteImage = (req: Request, res: Response, next: NextFunction) => {
  fileDelete(req.file!.path);
  next();
};

export default deleteImage;
