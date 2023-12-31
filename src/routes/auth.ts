import express from 'express';
import { register, login, refresh, logout, socialLogin } from '../controller/auth';
import limiter from '../middleware/limiter';

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

export default route;
