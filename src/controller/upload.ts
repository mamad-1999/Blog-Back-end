import { Request, Response, NextFunction } from 'express';
import User from '../model/User';
import sharp from 'sharp';
import { uploadImage } from '../utils/multer';
import fileDelete from '../utils/fileDeleter';

export const uploadProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    uploadImage.single('avatar')(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Maximum size is 6MB' });
        }
        res.status(400).json({ message: 'Error', err });
      } else {
        if (req.file) {
          const foundUser = await User.findById(req.user)
            .select('-password -refreshToken')
            .exec();

          if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
          }
          const fileUploadName = `${new Date().toISOString()}_${req.file.originalname}`;
          sharp(req.file.path)
            .jpeg({ quality: 70 })
            .resize(300, 300)
            .toFile(`src/uploads/sharp-${fileUploadName}`, (err) => {
              if (err) {
                return res.status(400).json({ err });
              }

              fileDelete(req.file!.path);
            });
          foundUser.image = `/src/uploads/sharp-${fileUploadName}`;
          await foundUser.save();

          res.status(200).json({
            message: 'User image profile update',
            pathImage: `/src/uploads/sharp-${fileUploadName}`,
          });
        } else {
          res.status(500).json({ message: 'No file uploaded' });
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
