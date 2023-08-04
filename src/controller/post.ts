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
    try {
        const checkData = await checkPostValidator({ ...req.body })
    if(checkData !== true){
        errorHandler('Invalid inputs', 400, checkData)
    }

    const foundUser = await User.findOne({ _id: req.user })
        .select('-password -refreshToken')
        .exec()
    
    if(!foundUser){
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const newPost = new Post({ ...req.body, userId: req.user })
    const savePost = await newPost.save()

    foundUser?.posts?.push(savePost as any)
    await foundUser.save()

    res.status(201).json({ message: "Post saved successfully", savePost })
    } catch (error) {
     next(error)   
    }
}