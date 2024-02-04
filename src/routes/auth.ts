import express from 'express';
import {
  register,
  login,
  refresh,
  logout,
  socialLogin,
  changePassword,
} from '../controller/auth';
import limiter from '../middleware/limiter';
import verifyJWT from '../middleware/verifyJWT';

const route = express.Router();

// Post => '/auth/register'
route.post('/register', limiter, register);

// Post => '/auth/login'
route.post('/login', limiter, login);

// Get => '/auth/refresh'
route.get('/refresh', refresh);

// Post => '/auth/logout'
route.post('/logout', logout);

// Post => '/auth/social'
route.post('/social', socialLogin);

// POST => '/auth/change-password'
route.post('/change-password', verifyJWT, changePassword);

export default route;
