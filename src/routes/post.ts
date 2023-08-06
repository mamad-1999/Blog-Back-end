import express from 'express';
import {
  createPost,
  deletePost,
  updatePost,
  getPost,
  getPosts,
} from '../controller/post';
import verifyJWT from '../middleware/verifyJWT';

const route = express.Router();

// POST => '/posts'
route.post('/', verifyJWT, createPost);

// DELETE => '/posts/:id'
route.delete('/:id', verifyJWT, deletePost);

// PUT => '/posts/:id'
route.put('/:id', verifyJWT, updatePost);

// GET => '/posts/:id'
route.get('/:id', getPost);

// GET => '/posts'
route.get('/', getPosts);

export default route;
