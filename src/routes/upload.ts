import express from 'express';
import verifyJWT from '../middleware/verifyJWT';

const route = express.Router();

route.post('/profile-img', verifyJWT);

route.post('/post-img', verifyJWT);

export default route;
