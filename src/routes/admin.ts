import express from 'express';
import verifyJWT from '../middleware/verifyJWT';
import verifyRole from '../middleware/verifyRole';
import {
  adminBlockedUser,
  adminUnBlockedUser,
  createAdmin,
  deleteAdmin,
  getAdmin,
  getAdmins,
  updateAdmin,
} from '../controller/admin';
import {
  getReadingLists,
  saveReadingList,
  unSaveReadingList,
} from '../controller/readingList';
import { favorites, getFavorites, unFavorites } from '../controller/favorites';
import {
  block,
  following,
  getAllFollower,
  getAllFollowing,
  getBlockList,
  getPostsByUserId,
  unBlock,
  unFollow,
} from '../controller/user';

const route = express.Router();

// PUT => '/admins/:id'
route.put('/:id', verifyJWT, verifyRole('admin'), updateAdmin);

// DELETE => '/admins/:id'
route.delete('/:id', verifyJWT, verifyRole('superAdmin'), deleteAdmin);

// POST => '/admins/:id'
route.post('/', verifyJWT, verifyRole('superAdmin'), createAdmin);

// GET => '/admins'
route.get('/', verifyJWT, verifyRole('superAdmin'), getAdmins);

// GET => '/admins/:aid'
route.get('/:aid', verifyJWT, verifyRole('admin'), getAdmin);

// POST => '/admins/reading-list/:postId'
route.post('/reading-list/:postId', verifyJWT, verifyRole('admin'), saveReadingList);

// DELETE => '/admins/reading-list/:postId'
route.delete('/reading-list/:postId', verifyJWT, verifyRole('admin'), unSaveReadingList);

// GET => '/admins/reading-list/:uid'
route.get('/reading-list/:uid', verifyJWT, verifyRole('admin'), getReadingLists);

// POST => '/admins/favorites'
route.post('/favorites', verifyJWT, verifyRole('admin'), favorites);

// DELETE => '/admins/un-favorites'
route.post('/un-favorites', verifyJWT, verifyRole('admin'), unFavorites);

// GET => '/admins/favorites/:uid'
route.get('/favorites/:uid', verifyJWT, verifyRole('admin'), getFavorites);

// GET => '/admins/my-post/:uid'
route.get('/my-post/:uid', verifyJWT, verifyRole('admin'), getPostsByUserId);

// GET => '/admins/following/:uid'
route.get('/following/:uid', verifyJWT, following);

// GET => '/admins/unfollow/:uid'
route.get('/unfollow/:uid', verifyJWT, unFollow);

// GET => '/admins/all-following/:uid'
route.get('/all-following/:uid', verifyJWT, getAllFollowing);

// GET => '/admins/block/:uid'
route.get('/block/:uid', verifyJWT, block);

// GET => '/admins/unblock/:uid'
route.get('/unblock/:uid', verifyJWT, unBlock);

// GET => '/admins/block-list/:uid'
route.get('/block-list/:uid', verifyJWT, getBlockList);

// GET => '/admins/all-follower/:uid'
route.get('/all-follower/:uid', verifyJWT, getAllFollower);

// POST => '/admins/block-user/:uid'
route.post('/block-user/:uid', verifyJWT, verifyRole('admin'), adminBlockedUser);

// POST => '/admins/unblock-user/:uid'
route.post('/unblock-user/:uid', verifyJWT, verifyRole('admin'), adminUnBlockedUser);

export default route;
