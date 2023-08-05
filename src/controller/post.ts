import { Request, Response, NextFunction } from 'express';
import checkPostValidator from '../validators/post';
import errorHandler from '../utils/errorHandler';
import User from '../model/User';
import Post from '../model/Post';
import { IAddPost } from '../types/IPost';
import mongoose from 'mongoose';

export const createPost = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    IAddPost,
    Record<string, never>
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const checkData = await checkPostValidator({ ...req.body });
    if (checkData !== true) {
      errorHandler('Invalid inputs', 400, checkData);
    }

    const foundUser = await User.findOne({ _id: req.user })
      .select('-password -refreshToken')
      .exec();

    if (!foundUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const newPost = new Post({ ...req.body, userId: req.user });
    const savePost = await newPost.save();

    foundUser?.posts?.push(savePost as never);
    await foundUser.save();

    res.status(201).json({ message: 'Post saved successfully', savePost });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
  req: Request<
    { id: string },
    Record<string, never>,
    Record<string, never>,
    Record<string, never>
  >,
  res: Response,
  next: NextFunction,
) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const foundUser = await User.findOne({ _id: req.user })
      .select('-password -refreshToken')
      .exec();

    if (!foundUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (post?.userId.toString() !== foundUser._id.toString()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await post.deleteOne();
    await foundUser.updateOne({ $pull: { posts: req.params.id } });
    await foundUser.save();

    res.status(200).json({ message: 'Post delete successfully', post });
  } catch (error) {
    next(error);
  }
};
