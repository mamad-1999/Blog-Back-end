import express from 'express';
import { updateUser, getUser, getUsers } from '../controller/user';
import verifyRole from '../middleware/verifyRole';

const route = express.Router();

// PUT => '/users/:id'
route.put('/:id', updateUser);

// GET => '/users/:id'
route.get('/:id', getUser);

// GET => '/users' /* admin */
route.get('/', verifyRole('admin'), getUsers);

export default route;
