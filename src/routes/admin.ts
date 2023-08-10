import express from 'express';
import verifyJWT from '../middleware/verifyJWT';
import verifyRole from '../middleware/verifyRole';
import { createAdmin, deleteAdmin, updateAdmin } from '../controller/admin';

const route = express.Router();

// PUT => '/admin/:id'
route.put('/:id', verifyJWT, verifyRole('admin'), updateAdmin);

// DELETE => '/admin/:id'
route.delete('/:id', verifyJWT, verifyRole('superAdmin'), deleteAdmin);

// POST => '/admin/:id'
route.post('/', verifyJWT, verifyRole('superAdmin'), createAdmin);

export default route;
