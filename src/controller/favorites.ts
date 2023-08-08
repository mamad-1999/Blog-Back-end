import { Request, Response, NextFunction } from 'express';
import { AcceptFavorites } from '../types/favorites';
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
