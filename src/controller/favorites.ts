import { Request, Response, NextFunction } from 'express';
import { AcceptFavorites } from '../types/favorites';
import mongoose from 'mongoose';
import User from '../model/User';

export const favorites = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    { category: AcceptFavorites },
    Record<string, never>
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const foundUser = await User.findById(req.user)
      .select('-password -refreshToken')
      .exec();
    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (foundUser.favoritesCategory.includes(req.body.category)) {
      return res
        .status(400)
        .json({ message: 'This item already exist in your favorites' });
    }

    await foundUser.updateOne({ $push: { favoritesCategory: req.body.category } });
    await foundUser.save();

    res.status(200).json({ message: 'save favorite' });
  } catch (error) {
    next(error);
  }
};

export const unFavorites = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    { category: AcceptFavorites },
    Record<string, never>
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const foundUser = await User.findById(req.user)
      .select('-password -refreshToken')
      .exec();
    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!foundUser.favoritesCategory.includes(req.body.category)) {
      return res
        .status(400)
        .json({ message: 'This item is not exist on your favorites' });
    }

    await foundUser.updateOne({ $pull: { favoritesCategory: req.body.category } });
    await foundUser.save();

    res.status(200).json({ message: 'unSave favorite' });
  } catch (error) {
    next(error);
  }
};

export const getFavorites = async (
  req: Request<
    { uid: string },
    Record<string, never>,
    Record<string, never>,
    Record<string, never>
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.uid)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    if (req.user?.toString() !== req.params.uid) {
      return res
        .status(401)
        .json({ message: 'You are not Authorized for get this user savePosts' });
    }

    const foundUser = await User.findById(req.params.uid).select(
      '-password -refreshToken',
    );

    if (!foundUser) {
      return res.status(200).json({ message: 'User not found' });
    }

    if (foundUser.favoritesCategory.length === 0) {
      return res.status(200).json({ message: 'User favorites not found', isEmpty: true });
    }

    res
      .status(200)
      .json({
        message: 'Get favorites successfully',
        data: foundUser.favoritesCategory,
        isEmpty: false,
      });
  } catch (error) {
    next(error);
  }
};
