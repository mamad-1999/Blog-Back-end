import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../model/User';
import { IUpdateUser } from '../types/IUser';
import checkUserData from '../validators/user';
import errorHandler from '../utils/errorHandler';
import Post from '../model/Post';
import Review from '../model/Review';
import fileDelete from '../utils/fileDeleter';

export const updateUser = async (
  req: Request<{ id: string }, Record<string, never>, IUpdateUser, Record<string, never>>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    if (req.user?.toString() !== req.params.id) {
      return res.status(401).json({ message: 'You are not Authorized update this user' });
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

    if (foundUser && foundUser.role !== 'user') {
      return res.status(400).json({ message: "You can't get this user data" });
    }

    const userRequest = await User.findById(req.user)
      .select('-password -refreshToken')
      .exec();

    if (userRequest?.role === 'superAdmin' || userRequest?.role === 'admin') {
      return res.status(200).json({ message: 'User get successfully', data: foundUser });
    }

    if (req.user?.toString() !== req.params.id) {
      return res
        .status(401)
        .json({ message: 'You are not Authorized for get this user info' });
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

  if (isNaN(pageNumber) || isNaN(userPerPage)) {
    return res.status(400).json({ message: 'Page and limit must be numbers' });
  }
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

    const foundUser = await User.findById(req.params.id).select(
      '-password -refreshToken',
    );

    if (foundUser?.role === 'admin' || foundUser?.role === 'superAdmin') {
      return res
        .status(401)
        .json({ message: 'You are not Authorized to delete this user' });
    }

    await User.deleteOne({ _id: req.params.id });

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

    if (isNaN(pageNumber) || isNaN(postPerPage)) {
      return res.status(400).json({ message: 'Page and limit must be numbers' });
    }

    const userPosts = await User.findById(req.params.uid)
      .select('-password -refreshToken')
      .populate({
        path: 'posts',
        populate: { path: '_id' },
        options: {
          skip: (pageNumber - 1) * postPerPage,
          limit: postPerPage,
          sort: { _id: 1 },
        },
      });

    if (!userPosts) {
      return res.status(404).json({ message: 'User Posts not found' });
    }

    const totalPosts = await Post.countDocuments({ userId: req.params.uid });

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

export const following = async (
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
    // Find the user who is following
    const A = await User.findById(req.user).select('-password -refreshToken').exec();

    // Find the user to follow
    const B = await User.findById(req.params.uid)
      .select('-password -refreshToken')
      .exec();

    if (req.user?.toString() === req.params.uid.toString()) {
      return res.status(401).json({ message: 'Access Denied!' });
    }

    if (A && B) {
      const isUserAlreadyFollowed = A.following.find((follower) => {
        return follower.toString() === B._id.toString();
      });

      if (isUserAlreadyFollowed) {
        return res.status(400).json({ message: 'You already followed this user' });
      }

      await User.findByIdAndUpdate(
        req.params.uid,
        { $addToSet: { follower: A._id } },
        { new: true },
      );

      await User.findByIdAndUpdate(
        req.user,
        { $addToSet: { following: B._id } },
        { new: true },
      );

      res.status(200).json({ message: 'Successfully followed' });
    } else {
      return res
        .status(404)
        .json({ message: 'User that you trying to follow not found' });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (
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
    if (req.user?.toString() !== req.params.uid) {
      return res
        .status(401)
        .json({ message: 'You are not Authorized to get posts of this user' });
    }

    const foundUser = await User.findById(req.params.uid);
    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (foundUser.role === 'admin') {
      return res
        .status(401)
        .json({ message: "You can't delete your account. Talk to the administrator" });
    }

    if (foundUser.role === 'superAdmin') {
      return res
        .status(401)
        .json({ message: "You can't delete your account. You are administrator" });
    }

    const posts = await Post.find({ userId: req.params.uid }).exec();
    for (const post of posts) {
      if (post.image) {
        fileDelete(post.image);
      }
      await post.deleteOne();
    }

    await Review.deleteMany({ author: req.params.uid });

    if (foundUser.image) {
      fileDelete(foundUser.image);
    }

    await foundUser.deleteOne();
    res.status(200).json({ message: 'User account deleted' });
  } catch (error) {
    next(error);
  }
};
