import express from 'express';
import { updateUser } from '../controller/user';

const route = express.Router();

// GET => '/users/:id'
route.put('/:id', updateUser);

export default route;
