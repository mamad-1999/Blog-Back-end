import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../model/User';
import Post from '../model/Post';
import Review from '../model/Review';
import checkReviewValidator from '../validators/review';
import { IAddReview, IReview } from '../types/IReview';
import checkUserBlocked from '../utils/checkUserBlocked';

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

    const isUserBlocked = await checkUserBlocked(post.userId, req.user!);
    if (isUserBlocked) {
      return res
        .status(403)
        .json({ message: 'Sorry, You Are Not Allowed to Add Review on This Post' });
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

    const blockedUsers = await User.find({ blocked: req.user })
      .select('_id')
      .lean()
      .exec();

    const reviews = await Review.find({ postId: req.params.id })
      .sort({ postedData: 1 })
      .populate({ path: 'author', model: 'User', select: '_id email name' })
      .lean()
      .exec();

    if (!reviews) {
      return res.status(404).json({ message: "Post doesn't have a review" });
    }

    const setReplyComment = (comment: IReview, threads: Record<string, IReview>) => {
      for (const thread in threads) {
        const value = threads[thread];

        if (thread.toString() === comment.parentId!.toString()) {
          value.children[comment._id.toString()] = comment;
          return;
        }

        if (value.children) {
          setReplyComment(comment, value.children);
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
      setReplyComment(comment, threads);
    }

    const filteredReviews = Object.values(threads).filter(
      (review) =>
        !blockedUsers.some((user) => String(user._id) === String(review.author._id)),
    );

    res.status(200).json({
      message: 'Get Reviews successfully',
      count: reviews.length,
      reviews: filteredReviews,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (
  req: Request<
    { id: string; pid: string },
    Record<string, never>,
    Record<string, never>,
    Record<string, never>
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(req.params.pid) ||
      !mongoose.Types.ObjectId.isValid(req.params.id)
    ) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const review = await Review.findById(req.params.id).exec();
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (req.user?.toString() !== review.author._id.toString()) {
      return res
        .status(401)
        .json({ message: 'You are not Authorized to Delete this review' });
    }

    const post = await Post.findById(req.params.pid).exec();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await review.deleteOne();
    await post.updateOne({ $pull: { reviews: req.params.id } });
    await post.save();

    res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
