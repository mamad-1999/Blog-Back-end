import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../model/User';
import { IUpdateUser } from '../types/IUser';
import checkUserData from '../validators/user';
import errorHandler from '../utils/errorHandler';

export const updateUser = async (
  req: Request<{ id: string }, Record<string, never>, IUpdateUser, Record<string, never>>,
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

    const checkData = await checkUserData({ ...req.body });
    if (checkData !== true) {
      errorHandler('Invalid inputs', 400, checkData);
    }

    const userUpdated = await User.findByIdAndUpdate(req.params.id, {
      $set: { ...req.body },
    }).select('-password -refreshToken');

    if (!updateUser) {
      return res.status(500).json({ message: 'Something wrong... Try again..' });
    }

    res.status(200).json({ message: 'User updated', userUpdated });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
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
    res.status(200).json({ message: 'User get data successfully', foundUser });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    Record<string, never>,
    { page?: string; limit?: string }
  >,
  res: Response,
  next: NextFunction,
) => {
  const pageNumber = parseInt(req.query.page || '1');
  const userPerPage = parseInt(req.query.limit || '4');
  try {
    const users = await User.find({ role: 'user' })
      .select('-password -refreshToken')
      .sort({ _id: 1 })
      .skip((pageNumber - 1) * userPerPage)
      .limit(userPerPage);

    const totalUsers = await User.countDocuments({ role: 'user' });

    res.status(200).json({
      message: 'Get users successfully',
      data: users,
      totalPosts: totalUsers,
      currentPage: pageNumber,
      nextPage: pageNumber + 1,
      previousPage: pageNumber - 1,
      hasNextPage: userPerPage * pageNumber < totalUsers,
      hasPreviousPage: pageNumber > 1,
      lastPage: Math.ceil(totalUsers / userPerPage),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
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
    const deleteUser = await User.findByIdAndDelete(req.params.id).select(
      '-password -refreshToken',
    );

    if (!deleteUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully', deleteUser });
  } catch (error) {
    next(error);
  }
};

export const getPostsByUserId = async (
  req: Request<
    { uid: string },
    Record<string, never>,
    Record<string, never>,
    { page?: string; limit?: string }
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
        .json({ message: 'You are not Authorized to get posts of this user' });
    }

    const pageNumber = parseInt(req.query.page || '1');
    const postPerPage = parseInt(req.query.limit || '4');

    const userPosts = await User.findById(req.params.uid)
      .select('-password -refreshToken')
      .populate({ path: 'posts', populate: { path: '_id' } })
      .sort({ _id: 1 })
      .skip((pageNumber - 1) * postPerPage)
      .limit(postPerPage);

    if (!userPosts) {
      return res.status(404).json({ message: 'User Posts not found' });
    }

    const totalPosts = userPosts.posts?.length || 0;

    res.status(200).json({
      message: 'Get Posts successfully',
      data: userPosts.posts,
      totalPosts: totalPosts,
      currentPage: pageNumber,
      nextPage: pageNumber + 1,
      previousPage: pageNumber - 1,
      hasNextPage: postPerPage * pageNumber < totalPosts,
      hasPreviousPage: pageNumber > 1,
      lastPage: Math.ceil(totalPosts / postPerPage),
    });
  } catch (error) {
    next(error);
  }
};
