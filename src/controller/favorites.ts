import { Request, Response, NextFunction } from 'express';
import { AcceptFavorites } from '../types/favorites';
import mongoose from 'mongoose';
import User from '../model/User';

export const favorites = async (
  req: Request<
    { postId: string },
    Record<string, never>,
    AcceptFavorites,
    Record<string, never>
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const foundUser = await User.findById(req.user)
      .select('-password -refreshToken')
      .exec();
    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await foundUser.updateOne({ $push: { favoritesCategory: req.body } });
    await foundUser.save();

    res.status(200).json({ message: 'save favorite' });
  } catch (error) {
    next(error);
  }
};
