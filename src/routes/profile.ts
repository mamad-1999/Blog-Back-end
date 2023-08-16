import express from 'express';
import verifyJWT from '../middleware/verifyJWT';
import { removeAvatar, uploadProfile } from '../controller/profile';
import sharpTransform from '../middleware/sharpTransform';
import { uploadImage } from '../utils/multer';
import handleMulterError from '../middleware/handleMulterError';

const route = express.Router();

route.post(
  '/upload-avatar',
  verifyJWT,
  uploadImage.single('avatar'),
  handleMulterError,
  sharpTransform(500, 500),
  uploadProfile,
);

route.delete('/remove-avatar', verifyJWT, removeAvatar);

export default route;
