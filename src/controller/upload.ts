import { Request, Response, NextFunction } from 'express';
import User from '../model/User';

export const uploadProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.file) {
      const foundUser = await User.findById(req.user)
        .select('-password -refreshToken')
        .exec();

      if (!foundUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      foundUser.image = `/src/uploads/sharp-${req.file.filename}`;
      await foundUser.save();

      res.status(200).json({
        message: 'User image profile update',
        pathImage: `/src/uploads/sharp-${req.file.filename}`,
      });
    } else {
      res.status(500).json({ message: 'No file uploaded' });
    }
  } catch (error) {
    next(error);
  }
};
