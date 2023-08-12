import express from 'express';
import verifyJWT from '../middleware/verifyJWT';
import { uploadProfile } from '../controller/upload';

const route = express.Router();

route.post('/profile-img', verifyJWT, uploadProfile);

route.post('/post-img', verifyJWT);

export default route;
