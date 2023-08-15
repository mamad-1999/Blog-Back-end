import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import fileDelete from '../utils/fileDeleter';

const sharpTransform = (req: Request, res: Response, next: NextFunction) => {
  sharp(req.file!.path)
    .jpeg({ quality: 70 })
    .resize(500, 500)
    .toFile(`src/uploads/sharp-${req.file?.filename}`, (err) => {
      if (err) {
        return res.status(400).json({ message: 'Error', err });
      }

      fileDelete(req.file!.path);

      req.file!.path = `src/uploads/sharp-${req.file?.filename}`;
      next();
    });
};

export default sharpTransform;
