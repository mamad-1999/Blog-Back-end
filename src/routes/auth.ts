import express from 'express';
import { register, login } from '../controller/auth';

const route = express.Router()

// Post => '/auth/register'
route.post('/register', register)

route.post('/login', login)

export default route;