import express from 'express';
import verifyJWT from '../middleware/verifyJWT';
import verifyRole from '../middleware/verifyRole';
import { updateAdmin } from '../controller/admin';

const route = express.Router();

// PUT => '/admin/:id'
route.put('/:id', verifyJWT, verifyRole('admin'), updateAdmin);

export default route;
