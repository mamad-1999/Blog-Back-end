import express from 'express';
import { updateUser, getUser, getUsers, deleteUser } from '../controller/user';
import { favoritesPost } from '../controller/favorites';
import verifyRole from '../middleware/verifyRole';
import verifyJWT from '../middleware/verifyJWT';

const route = express.Router();

// PUT => '/users/:id'
route.put('/:id', verifyJWT, updateUser);

// GET => '/users/:id'
route.get('/:id', verifyJWT, getUser);

// GET => '/users' /* admin */
route.get('/', verifyJWT, verifyRole('admin'), getUsers);

// DELETE => '/users/:id' /* admin */
route.delete('/:id', verifyJWT, verifyRole('admin'), deleteUser);

// POST => '/users/favorites'
route.post('/favorites/:postId', verifyJWT, favoritesPost);

// DELETE => '/users/favorites'
route.delete('/favorites/:postId', verifyJWT);

export default route;
