import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../model/User';
import Post from '../model/Post';
import checkUserBlocked from '../utils/checkUserBlocked';

export const saveReadingList = async (
  req: Request<
    { postId: string },
    Record<string, never>,
    Record<string, never>,
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

    const post = await Post.findById(req.params.postId).exec();
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isUserBlocked = await checkUserBlocked(post.userId, req.user!);
    if (isUserBlocked) {
      return res
        .status(403)
        .json({ message: 'Sorry, You Are Not Allowed to Access This Post' });
    }

    const isPostAlreadyInReadingList = foundUser.readingList.includes(post._id);
    if (isPostAlreadyInReadingList) {
      return res.status(400).json({ message: 'This post is already in readingList' });
    }

    foundUser.readingList.push(post._id);
    await foundUser.save();

    res.status(201).json({ message: 'Post Saved' });
  } catch (error) {
    next(error);
  }
};

export const unSaveReadingList = async (
  req: Request<
    { postId: string },
    Record<string, never>,
    Record<string, never>,
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

    const post = await Post.findById(req.params.postId).exec();
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isPostAlreadyInReadingList = foundUser.readingList.includes(post._id);
    if (!isPostAlreadyInReadingList) {
      return res.status(400).json({ message: "This post isn't in readingList" });
    }

    await foundUser.updateOne({ $pull: { readingList: req.params.postId } });
    await foundUser.save();

    res.status(200).json({ message: 'Post unSaved' });
  } catch (error) {
    next(error);
  }
};

export const getReadingLists = async (
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
        .json({ message: 'You are not Authorized for get this user ReadingLists' });
    }
    const pageNumber = parseInt(req.query.page || '1');
    const postPerPage = parseInt(req.query.limit || '6');

    if (isNaN(pageNumber) || isNaN(postPerPage)) {
      return res.status(400).json({ message: 'Page and limit must be numbers' });
    }

    const userReadingLists = await User.findById(req.params.uid)
      .select('-password -refreshToken')
      .populate({
        path: 'readingList',
        select: '-tags -reviews',
        populate: { path: '_id' },
        options: {
          skip: (pageNumber - 1) * postPerPage,
          limit: postPerPage,
          sort: { _id: 1 },
        },
      });

    if (!userReadingLists) {
      return res.status(404).json({ message: 'User readingList not found' });
    }

    const totalReadingLists = userReadingLists.readingList.length;

    res.status(200).json({
      message: 'Get reading list successfully',
      data: userReadingLists.readingList,
      totalPosts: totalReadingLists,
      currentPage: pageNumber,
      nextPage: pageNumber + 1,
      previousPage: pageNumber - 1,
      hasNextPage: postPerPage * pageNumber < totalReadingLists,
      hasPreviousPage: pageNumber > 1,
      lastPage: Math.ceil(totalReadingLists / postPerPage),
    });
  } catch (error) {
    next(error);
  }
};
