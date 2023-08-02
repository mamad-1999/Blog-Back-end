import express from 'express';
import { register, login, refresh } from '../controller/auth';

const route = express.Router()

// Post => '/auth/register'
route.post('/register', register)

// Post => '/auth/login'
route.post('/login', login)

// Get => '/auth/refresh'
route.get('/refresh', refresh)

export default route;