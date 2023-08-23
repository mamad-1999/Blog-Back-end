import express from 'express';
import verifyJWT from '../middleware/verifyJWT';
import { getMyInfo, removeAvatar, uploadProfile } from '../controller/profile';
import { uploadImage } from '../utils/multer';
import handleMulterError from '../middleware/handleMulterError';
import deleteImage from '../middleware/deleteImage';

const route = express.Router();

// POST => '/profile/upload-avatar'
route.post(
  '/upload-avatar',
  verifyJWT,
  uploadImage.single('avatar'),
  handleMulterError,
  uploadProfile,
  deleteImage,
);

// DELETE => '/profile/remove-avatar'
route.delete('/remove-avatar', verifyJWT, removeAvatar);

// GET => '/profile/my-info'
route.get('/my-info', verifyJWT, getMyInfo);

export default route;
