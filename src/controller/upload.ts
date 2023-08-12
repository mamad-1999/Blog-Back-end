import { Request, Response, NextFunction } from 'express';
import User from '../model/User';
import sharp from 'sharp';
import { uploadImage } from '../utils/multer';
import { nanoid } from 'nanoid';

export const uploadProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    uploadImage.single('image')(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Maximum size is 6MB' });
        }
        res.status(400).json({ err });
      } else {
        if (req.file) {
          const foundUser = await User.findById(req.user)
            .select('-password -refreshToken')
            .exec();

          if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
          }
          const fileUploadName = `${nanoid()}_${req.file.originalname}`;
          await sharp(req.file.buffer)
            .jpeg({ quality: 70 })
            .toFile(`../public/images/${fileUploadName}`)
            .catch((err) => {
              return res
                .status(400)
                .json({ message: 'Something was wrong... Please try again', err });
            });

          foundUser.image = `/images/${fileUploadName}`;
          await foundUser.save();

          res.status(200).json({
            message: 'User image profile update',
            pathImage: `/images/${fileUploadName}`,
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
