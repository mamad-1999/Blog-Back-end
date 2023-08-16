import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../model/User';
import Post from '../model/Post';
import Review from '../model/Review';
import checkReviewValidator from '../validators/review';
import { IAddReview, IReview } from '../types/IReview';

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
      postId: req.params.id,
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

export const getReviewsByPostID = async (
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

    const reviews = await Review.find({ postId: req.params.id })
      .sort({ postedData: 1 })
      .populate({ path: 'author', model: 'User', select: '_id email name' })
      .lean()
      .exec();

    if (!reviews) {
      return res.status(404).json({ message: "Post doesn't have a review" });
    }

    const rec = (comment: IReview, threads: Record<string, IReview>) => {
      for (const thread in threads) {
        const value = threads[thread];

        if (thread.toString() === comment.parentId!.toString()) {
          value.children[comment._id.toString()] = comment;
          return;
        }

        if (value.children) {
          rec(comment, value.children);
        }
      }
    };

    const threads: Record<string, IReview> = {};
    let comment: IReview;
    for (let i = 0; i < reviews.length; i++) {
      comment = reviews[i];
      comment.children = {};
      const parentId = comment.parentId;
      if (!parentId) {
        threads[comment._id.toString()] = comment;
        continue;
      }
      rec(comment, threads);
    }

    res.status(200).json({
      message: 'Get Reviews successfully',
      count: reviews.length,
      reviews: threads,
    });
  } catch (error) {
    next(error);
  }
};
