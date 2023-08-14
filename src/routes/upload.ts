import express from 'express';
import verifyJWT from '../middleware/verifyJWT';
import { uploadProfile } from '../controller/upload';
import sharpTransform from '../middleware/sharpTransform';
import { uploadImage } from '../utils/multer';

const route = express.Router();

route.post(
  '/profile-img',
  verifyJWT,
  uploadImage.single('avatar'),
  sharpTransform,
  uploadProfile,
);

route.post('/post-img', verifyJWT);

export default route;
