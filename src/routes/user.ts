import express from 'express';
import { updateUser, getUser } from '../controller/user';

const route = express.Router();

// PUT => '/users/:id'
route.put('/:id', updateUser);

// GET => '/users/:id'
route.get('/:id', getUser);

export default route;
