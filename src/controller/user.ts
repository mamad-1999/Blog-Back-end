import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../model/User';

export const updateUser = async (
  req: Request<
    { id: string },
    Record<string, never>,
    Record<string, never>,
    Record<string, never>
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const foundUser = await User.findById(req.params.id).select(
      '-password -refreshToken',
    );

    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (foundUser!.role !== 'user' && foundUser._id.toString() !== req.params.id) {
      return res
        .status(401)
        .json({ message: 'You are not Authorized to update this user' });
    }

    const userUpdated = await User.findByIdAndUpdate(req.params.id, {
      $set: { ...req.body },
    });

    if (!updateUser) {
      return res.status(500).json({ message: 'Something wrong... Try again..' });
    }

    res.status(200).json({ message: 'User updated', userUpdated });
  } catch (error) {
    next(error);
  }
};
