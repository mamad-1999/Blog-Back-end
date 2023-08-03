import { Request, Response, NextFunction } from "express"
import checkPostValidator from "../validators/post"
import errorHandler from "../utils/errorHandler"
import User from "../model/User"
import Post from "../model/Post"
import { IAddPost } from "../types/IPost"

export const createPost = async (
    req: Request<{}, {}, IAddPost, {}>, 
    res: Response,
    next: NextFunction
) => {
    // console.log((req as any).user)
}