import { Request, Response, NextFunction } from 'express';
import checkPostValidator from '../validators/post';
import errorHandler from '../utils/errorHandler';
import User from '../model/User';
import Post from '../model/Post';
import { IAddPost, IUpdatePost, PostFilters } from '../types/IPost';
import mongoose from 'mongoose';
import fileDelete from '../utils/fileDeleter';

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
    if (req.file) {
      const foundUser = await User.findOne({ _id: req.user })
        .select('-password -refreshToken')
        .exec();

      if (!foundUser) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const newPost = new Post({
        ...req.body,
        image: req.file.path,
        userId: req.user,
      });
      const savePost = await newPost.save();

      foundUser?.posts?.push(savePost as never);
      await foundUser.save();

      res.status(201).json({ message: 'Post saved successfully', savePost });
    } else {
      res.status(400).json({ message: 'Please upload the Post image' });
    }
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

    const foundUser = await User.findOne({ _id: req.user })
      .select('-password -refreshToken')
      .exec();

    if (!foundUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (post?.userId.toString() !== foundUser._id.toString()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const postImage = post.image;

    await post.deleteOne();
    await foundUser.updateOne({ $pull: { posts: req.params.id } });
    await foundUser.save().then(() => {
      fileDelete(postImage);
    });

    res.status(200).json({ message: 'Post delete successfully', post });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (
  req: Request<{ id: string }, Record<string, never>, IUpdatePost, Record<string, never>>,
  res: Response,
  next: NextFunction,
) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  try {
    const checkData = await checkPostValidator({ ...req.body });
    if (checkData !== true) {
      errorHandler('Invalid inputs', 400, checkData);
    }
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

    let updatedData;
    const postImage = post.image;

    if (req.file) {
      updatedData = { ...req.body, image: req.file.path };
    } else {
      updatedData = { ...req.body };
    }

    const postUpdated = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $set: updatedData,
      },
      { new: true },
    );

    if (!postUpdated) {
      return res.status(500).json({ message: 'Update Post was wrong!... Try again' });
    }

    if (postUpdated.image !== postImage) {
      fileDelete(postImage);
    }

    res.status(200).json({ message: 'Update Post successfully', postUpdated });
  } catch (error) {
    next(error);
  }
};

export const getPost = async (
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
    const post = await Post.findById(req.params.id).populate('userId', 'email image');
    res.status(200).json({ message: 'Post found successfully', post });
    res.status;
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    Record<string, never>,
    { page?: string; limit?: string; search?: string }
  >,
  res: Response,
  next: NextFunction,
) => {
  const { query } = req;
  const pageNumber = parseInt(query.page || '1');
  const postPerPage = parseInt(query.limit || '2');

  if (isNaN(pageNumber) || isNaN(postPerPage)) {
    return res.status(400).json({ message: 'Page and limit must be numbers' });
  }

  const filters: PostFilters = {};
  if (query.search) {
    filters.title = {
      $regex: new RegExp('.*' + query.search?.trim() + '.*', 'ig'),
    };
  }
  try {
    const posts = await Post.find(filters)
      .sort({ _id: 1 })
      .skip((pageNumber - 1) * postPerPage)
      .limit(postPerPage);

    const totalPosts = await Post.countDocuments(filters);

    res.status(200).json({
      message: 'Get Posts successfully',
      data: posts,
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
