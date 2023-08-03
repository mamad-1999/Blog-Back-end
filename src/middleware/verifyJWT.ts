import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import errorHandler from '../utils/errorHandler'

const verifyJWT = (req: Request, res: Response, next: NewableFunction) => {
    const authorizationHeader = req.headers.authorization || ((req.headers.Authorization as string))

    if(!authorizationHeader.startsWith('bearer ')){
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = authorizationHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET?.toString()!
        ) as { email: string }
        if (!decoded || !decoded.email){
            errorHandler('Forbidden', 403)
        }
        req.user = decoded.email
        next()
    } catch (error) {
        next(error)
    }
}