import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../model/User';
import Post from '../model/Post';
import Review from '../model/Review';
import checkReviewValidator from '../validators/review';
import { IAddReview } from '../types/IReview';

export const addReview = async (
  req: Request<{ id: string }, Record<string, never>, IAddReview, Record<string, never>>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const post = await Post.findById(req.params.id).exec();
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!req.body.commentText) {
      return res.status(400).json({ message: 'commentText is required' });
    }

    const checkData = await checkReviewValidator({ ...req.body });
    if (checkData !== true) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    const foundUser = await User.findById(req.user)
      .select('-password -refreshToken')
      .exec();
    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const data: IAddReview = {
      author: foundUser._id,
      commentText: req.body.commentText,
    };

    if ('parentId' in req.body) {
      data.parentId = req.body.parentId;
    }

    if ('depth' in req.body) {
      data.depth = req.body.depth;
    }

    const review = await Review.create(data);

    post.reviews.push(review as never);
    await post.save();

    res.status(201).json({ message: 'Review Added', data: review });
  } catch (error) {
    next(error);
  }
};
