import express from 'express';
import verifyJWT from '../middleware/verifyJWT';
import { uploadProfile } from '../controller/upload';
import sharpTransform from '../middleware/sharpTransform';
import { uploadImage } from '../utils/multer';
import handleMulterError from '../middleware/handleMulterError';

const route = express.Router();

route.post(
  '/profile-img',
  verifyJWT,
  uploadImage.single('avatar'),
  handleMulterError,
  sharpTransform,
  uploadProfile,
);

route.post('/post-img', verifyJWT);

export default route;
