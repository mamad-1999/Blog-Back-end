import express from 'express';
import {
  createPost,
  deletePost,
  updatePost,
  getPost,
  getPosts,
  likePost,
  getPostLikes,
} from '../controller/post';
import verifyJWT from '../middleware/verifyJWT';
import { uploadImage } from '../utils/multer';
import sharpTransform from '../middleware/sharpTransform';
import handleMulterError from '../middleware/handleMulterError';

const route = express.Router();

// POST => '/posts'
route.post(
  '/',
  verifyJWT,
  uploadImage.single('image'),
  sharpTransform,
  handleMulterError,
  createPost,
);

// DELETE => '/posts/:id'
route.delete('/:id', verifyJWT, deletePost);

// PUT => '/posts/:id'
route.put(
  '/:id',
  verifyJWT,
  uploadImage.single('image'),
  sharpTransform,
  handleMulterError,
  updatePost,
);

// GET => '/posts/:id'
route.get('/:id', getPost);

// GET => '/posts'
route.get('/', getPosts);

// POST => '/posts/like/:id'
route.post('/like/:id', verifyJWT, likePost);

// GET => '/posts/post-likes/:uid'
route.get('/post-likes/:uid', verifyJWT, getPostLikes);

export default route;
