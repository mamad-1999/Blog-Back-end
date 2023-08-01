import express from 'express';
import { register } from '../controller/auth';

const route = express.Router()

// Post => '/auth/register'
route.post('/register', register)

route.post('/login', )

export default route;