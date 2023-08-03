import express from 'express'
import { createPost } from '../controller/post'
import verifyJWT from '../middleware/verifyJWT'

const route = express.Router()

// POST => '/posts'
route.post('/', verifyJWT, createPost)

export default route