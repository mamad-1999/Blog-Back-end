import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../model/User';
import Post from '../model/Post';

export const favoritesPost = async (
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

    foundUser.favoritesPost.push(post._id);
    await foundUser.save();

    post.likesCount++;
    await post.save();

    res.status(200).json({ message: 'Post liked', like: post.likesCount });
  } catch (error) {
    next(error);
  }
};
