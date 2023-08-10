import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../model/User';
import checkUserData from '../validators/user';
import { IUpdateUser } from '../types/IUser';

export const updateAdmin = async (
  req: Request<{ id: string }, Record<string, never>, IUpdateUser, Record<string, never>>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const foundUser = await User.findById(req.user)
      .select('-password -refreshToken')
      .exec();

    if (!foundUser) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (foundUser.role !== 'admin' && req.user?.toString() !== req.params.id) {
      return res
        .status(401)
        .json({ message: 'You are not Authorized to update this user' });
    }

    const checkData = await checkUserData({ ...req.body });
    if (checkData !== true) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    const updatedAdmin = await User.findByIdAndUpdate(req.params.id, {
      $set: { ...req.body },
    }).select('-password -refreshToken');

    if (!updateAdmin) {
      return res.status(500).json({ message: 'Something wrong... Try again' });
    }

    res.status(200).json({ message: 'Update admin successfully', data: updatedAdmin });
  } catch (error) {
    next(error);
  }
};

export const deleteAdmin = async (
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

    const foundUser = await User.findById(req.params.id)
      .select('-password -refreshToken')
      .exec();

    if (!foundUser || foundUser.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    foundUser.role = 'user';
    await foundUser.save();

    res.status(200).json({ message: 'Admin deleted', data: foundUser });
  } catch (error) {
    next(error);
  }
};
