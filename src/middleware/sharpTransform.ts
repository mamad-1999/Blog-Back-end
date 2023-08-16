import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import fileDelete from '../utils/fileDeleter';

const sharpTransform = (width: number, height: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    sharp(req.file!.path)
      .jpeg({ quality: 70 })
      .resize(width, height)
      .toFile(`src/uploads/sharp-${req.file?.filename}`, (err) => {
        if (err) {
          return res.status(400).json({ message: 'Error', err });
        }

        fileDelete(req.file!.path);

        req.file!.path = `src/uploads/sharp-${req.file?.filename}`;
        next();
      });
  };
};

export default sharpTransform;
