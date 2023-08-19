import express from 'express';
import verifyJWT from '../middleware/verifyJWT';
import verifyRole from '../middleware/verifyRole';
import {
  getReadingLists,
  saveReadingList,
  unSaveReadingList,
} from '../controller/readingList';
import { favorites, getFavorites, unFavorites } from '../controller/favorites';
import {
  following,
  getAllFollower,
  getAllFollowing,
  getPostsByUserId,
  unFollow,
} from '../controller/user';

const route = express.Router();

// POST => '/super-admin/reading-list/:postId'
route.post('/reading-list/:postId', verifyJWT, verifyRole('superAdmin'), saveReadingList);

// DELETE => '/super-admin/reading-list/:postId'
route.delete(
  '/reading-list/:postId',
  verifyJWT,
  verifyRole('superAdmin'),
  unSaveReadingList,
);

// GET => '/super-admin/reading-list/:uid'
route.get('/reading-list/:uid', verifyJWT, verifyRole('superAdmin'), getReadingLists);

// POST => '/super-admin/favorites'
route.post('/favorites', verifyJWT, verifyRole('superAdmin'), favorites);

// DELETE => '/super-admin/un-favorites'
route.post('/un-favorites', verifyJWT, verifyRole('superAdmin'), unFavorites);

// GET => '/super-admin/favorites/:uid'
route.get('/favorites/:uid', verifyJWT, verifyRole('superAdmin'), getFavorites);

// GET => '/super-admin/my-post/:uid'
route.get('/my-post/:uid', verifyJWT, verifyRole('superAdmin'), getPostsByUserId);

// GET => '/super-admin/following/:uid'
route.get('/following/:uid', verifyJWT, following);

// GET => '/super-admin/unfollow/:uid'
route.get('/unfollow/:uid', verifyJWT, unFollow);

// GET => '/super-admin/all-following/:uid'
route.get('/all-following/:uid', verifyJWT, getAllFollowing);

// GET => '/super-admin/all-follower/:uid'
route.get('/all-follower/:uid', verifyJWT, getAllFollower);

export default route;
