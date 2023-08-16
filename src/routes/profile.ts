import express from 'express';
import verifyJWT from '../middleware/verifyJWT';
import { removeAvatar, uploadProfile } from '../controller/profile';
import { uploadImage } from '../utils/multer';
import handleMulterError from '../middleware/handleMulterError';
import deleteImage from '../middleware/deleteImage';

const route = express.Router();

route.post(
  '/upload-avatar',
  verifyJWT,
  uploadImage.single('avatar'),
  handleMulterError,
  uploadProfile,
  deleteImage,
);

route.delete('/remove-avatar', verifyJWT, removeAvatar);

export default route;
