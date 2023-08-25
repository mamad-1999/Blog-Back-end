import { Request, Response, NextFunction } from 'express';
import checkPostValidator from '../validators/post';
import errorHandler from '../utils/errorHandler';
import User from '../model/User';
import Post from '../model/Post';
import { IAddPost, IUpdatePost, PostFilters } from '../types/IPost';
import mongoose from 'mongoose';
import fileDelete from '../utils/fileDeleter';
import sharp from 'sharp';
import checkUserBlocked from '../utils/checkUserBlocked';

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
      next();
    }
    if (req.file) {
      const foundUser = await User.findOne({ _id: req.user })
        .select('-password -refreshToken')
        .exec();

      if (!foundUser) {
        res.status(401).json({ message: 'Unauthorized' });
        next();
      }

      if (foundUser?.isAdminBlocked) {
        res.status(401).json({ message: 'Access Denied! You are blocked by admin' });
        next();
      }

      await sharp(req.file!.path)
        .jpeg({ quality: 70 })
        .resize(800, 500)
        .toFile(`src/uploads/sharp-${req.file?.filename}`)
        .then(() => {
          fileDelete(req.file!.path);
          req.file!.path = `src/uploads/sharp-${req.file?.filename}`;
        });

      const newPost = await Post.create({
        ...req.body,
        image: req.file!.path,
        userId: req.user,
      });

      foundUser?.posts?.push(newPost as never);
      await foundUser!.save();
      res.status(201).json({ message: 'Post saved successfully', newPost });
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
    res.status(400).json({ message: 'Invalid id' });
    next();
  }

  try {
    const checkData = await checkPostValidator({ ...req.body });
    if (checkData !== true) {
      errorHandler('Invalid inputs', 400, checkData);
      next();
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      next();
    }

    const foundUser = await User.findOne({ _id: req.user })
      .select('-password -refreshToken')
      .exec();

    if (!foundUser) {
      res.status(401).json({ message: 'Unauthorized' });
      next();
    }

    if (foundUser?.isAdminBlocked) {
      res.status(401).json({ message: 'Access Denied! You are blocked by admin' });
      next();
    }

    if (post?.userId.toString() !== foundUser!._id.toString()) {
      res.status(401).json({ message: 'Unauthorized' });
      next();
    }

    let updatedData = {};
    const postImage = post!.image;

    if (req.file) {
      await sharp(req.file!.path)
        .jpeg({ quality: 70 })
        .resize(800, 500)
        .toFile(`src/uploads/sharp-${req.file?.filename}`)
        .then(() => {
          fileDelete(req.file!.path);
          req.file!.path = `src/uploads/sharp-${req.file?.filename}`;
          updatedData = { ...req.body, image: req.file!.path };
        });
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
    const post = await Post.findById(req.params.id).populate('userId', '_id image name');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ message: 'Post found successfully', post });
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
  const postPerPage = parseInt(query.limit || '8');

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
      .select('_id image likes userId title')
      .populate('userId', '_id image name')
      .sort({ _id: 1 })
      .skip((pageNumber - 1) * postPerPage)
      .limit(postPerPage);

    const postsFilter = posts.filter((item) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return !item.userId?.blocked?.includes(req.user);
    });

    const totalPosts = await Post.countDocuments(filters);

    res.status(200).json({
      message: 'Get Posts successfully',
      data: postsFilter,
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

// Like and Unlike
export const likePost = async (
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

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const foundUser = await User.findById(req.user)
      .select('-password -refreshToken')
      .exec();

    if (!foundUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (foundUser?.isAdminBlocked) {
      return res.status(401).json({ message: 'Access Denied! You are blocked by admin' });
    }

    const isUserBlocked = await checkUserBlocked(post.userId, req.user!);
    if (isUserBlocked) {
      return res
        .status(403)
        .json({ message: 'Sorry, You Are Not Allowed to Like This Post' });
    }

    if (post.likes.includes(req.user!)) {
      await post.updateOne({ $pull: { likes: req.user } });
      await post.save();

      await foundUser.updateOne({ $pull: { favoritesPost: post.id } });
      await foundUser.save();
      return res.status(200).json({ message: 'Post Unlike', likes: post.likes.length });
    }

    // If post doesn't like this code run
    post.likes.push(req.user!);
    await post.save();

    foundUser.favoritesPost.push(post.id);
    await foundUser.save();

    res.status(200).json({ message: 'Post Like', likes: post.likes.length });
  } catch (error) {
    next(error);
  }
};

export const getPostLikes = async (
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

    const userPostLikes = await User.findById(req.params.uid)
      .select('-password -refreshToken')
      .populate({
        path: 'favoritesPost',
        populate: { path: '_id' },
        select: '_id image likes userId title',
        options: {
          skip: (pageNumber - 1) * postPerPage,
          limit: postPerPage,
          sort: { _id: 1 },
        },
      });

    if (!userPostLikes) {
      return res.status(404).json({ message: 'User favoritesPost not found' });
    }
    const totalPostLikes = userPostLikes.favoritesPost.length;

    res.status(200).json({
      message: 'Get favoritesPost successfully',
      data: userPostLikes.favoritesPost,
      totalPosts: totalPostLikes,
      currentPage: pageNumber,
      nextPage: pageNumber + 1,
      previousPage: pageNumber - 1,
      hasNextPage: postPerPage * pageNumber < totalPostLikes,
      hasPreviousPage: pageNumber > 1,
      lastPage: Math.ceil(totalPostLikes / postPerPage),
    });
  } catch (error) {
    next(error);
  }
};
