import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

type DestinationCallbackType = (error: Error | null, destination: string) => void;
type FileNameCallbackType = (error: Error | null, filename: string) => void;

const fileAccept = ['image/png', 'image/jpg', 'image/jpeg'];

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    callback: DestinationCallbackType,
  ) => {
    callback(null, 'src/uploads/');
  },
  filename: (req: Request, file: Express.Multer.File, callback: FileNameCallbackType) => {
    callback(null, `${new Date().toISOString()}_${file.originalname}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) => {
  if (fileAccept.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Just (jpeg, png and jpg) are accepted'));
  }
};

export const uploadImage = multer({
  storage,
  // dest: 'images',
  limits: { fileSize: 6000000 },
  fileFilter,
});
