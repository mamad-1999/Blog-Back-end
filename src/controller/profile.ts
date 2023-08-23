import { Request, Response, NextFunction } from 'express';
import User from '../model/User';
import fileDelete from '../utils/fileDeleter';
import checkUserData from '../validators/user';
import sharp from 'sharp';
import { ISetUserNameAndAvatar } from '../types/IUser';

export const uploadProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.file) {
      const foundUser = await User.findById(req.user)
        .select('-password -refreshToken')
        .exec();

      if (!foundUser) {
        res.status(404).json({ message: 'User not found' });
        next();
      }

      if (foundUser && foundUser.image) {
        fileDelete(foundUser.image);
        next();
      }

      await sharp(req.file!.path)
        .jpeg({ quality: 70 })
        .resize(500, 500)
        .toFile(`src/uploads/sharp-${req.file?.filename}`)
        .then(() => {
          fileDelete(req.file!.path);
          req.file!.path = `src/uploads/sharp-${req.file?.filename}`;

          foundUser!.image = `src/uploads/sharp-${req.file!.filename}`;
          foundUser!.save();

          res.status(201).json({
            message: 'User image profile update',
            pathImage: `src/uploads/sharp-${req.file!.filename}`,
          });
        });
    } else {
      res.status(500).json({ message: 'No file uploaded' });
    }
  } catch (error) {
    next(error);
  }
};

export const removeAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const foundUser = await User.findById(req.user)
      .select('-password -refreshToken')
      .exec();

    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (foundUser && foundUser.image) {
      fileDelete(foundUser.image);
      foundUser.image = '';
      await foundUser.save();

      return res.status(200).json({ message: 'Your avatar deleted' });
    }

    res.status(400).json({ message: "You don't have any avatar" });
  } catch (error) {
    next(error);
  }
};

export const getMyInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const foundUser = await User.findById(req.user)
      .select('-password -refreshToken')
      .exec();

    if (!foundUser) {
      return res.status(400).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Get info successfully', data: foundUser });
  } catch (error) {
    next(error);
  }
};

export const setNameAndAvatar = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    ISetUserNameAndAvatar,
    Record<string, never>
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username } = req.body;

    const checkData = await checkUserData({ ...req.body });
    if (checkData !== true) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    const userNameWithAtSign = `@${username}`;
    if (username) {
      const isUserNameAlreadyUsed = await User.findOne({
        username: userNameWithAtSign,
      }).exec();
      if (isUserNameAlreadyUsed) {
        res.status(400).json({ message: 'This username already used by another user' });
        next();
      }
    }

    const userInfo: ISetUserNameAndAvatar = {};

    if (req.file) {
      await sharp(req.file!.path)
        .jpeg({ quality: 70 })
        .resize(500, 500)
        .toFile(`src/uploads/sharp-${req.file?.filename}`)
        .then(() => {
          fileDelete(req.file!.path);
          req.file!.path = `src/uploads/sharp-${req.file?.filename}`;

          userInfo.image = req.file?.path;
        });
    }

    if (!req.body.username) {
      userInfo.username = '@Noting';
    } else {
      userInfo.username = userNameWithAtSign;
    }

    const foundUser = await User.findById(req.user)
      .select('-password -refreshToken')
      .exec();

    if (!foundUser) {
      res.status(404).json({ message: 'User not found' });
      next();
    }

    const user = await User.findByIdAndUpdate(req.user, {
      $set: { ...userInfo, name: userInfo.username },
    });

    if (!user) {
      res.status(500).json({ message: 'Something was wrong!... Please try again' });
      next();
    }

    res.status(200).json({ message: 'Set successfully' });
  } catch (error) {
    next(next);
  }
};
