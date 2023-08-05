import express from 'express';
import { createPost, deletePost } from '../controller/post';
import verifyJWT from '../middleware/verifyJWT';

const route = express.Router();

// POST => '/posts'
route.post('/', verifyJWT, createPost);

// DELETE => '/posts/:id'
route.delete('/:id', verifyJWT, deletePost);

export default route;
