import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { nanoid } from 'nanoid';

type DestinationCallbackType = (error: Error | null, destination: string) => void;
type FileNameCallbackType = (error: Error | null, filename: string) => void;

const fileAccept = ['image/png', 'image/jpg', 'image/jpeg'];

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    callback: DestinationCallbackType,
  ) => {
    callback(null, '../public/images');
  },
  filename: (req: Request, file: Express.Multer.File, callback: FileNameCallbackType) => {
    callback(null, `${nanoid()}_${file.originalname}`);
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
  limits: { fileSize: 4000000 },
  fileFilter,
});
