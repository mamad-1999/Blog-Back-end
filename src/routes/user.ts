import express from 'express';
import { updateUser, getUser, getUsers, deleteUser } from '../controller/user';
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

export default route;
