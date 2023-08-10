import express from 'express';
import verifyJWT from '../middleware/verifyJWT';
import verifyRole from '../middleware/verifyRole';
import { deleteAdmin, updateAdmin } from '../controller/admin';

const route = express.Router();

// PUT => '/admin/:id'
route.put('/:id', verifyJWT, verifyRole('admin'), updateAdmin);

// DELETE => '/admin/:id'
route.delete('/:id', verifyJWT, verifyRole('superAdmin'), deleteAdmin);

export default route;
