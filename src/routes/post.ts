import express from 'express'
import { createPost } from '../controller/post'

const route = express.Router()

// POST => '/posts'
route.post('/', createPost)

export default route