import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import checkRegisterValidation from '../validators/register';
import checkLoginValidation from '../validators/login';
import errorHandler from "../utils/errorHandler";
import User from "../model/User";
import mongoose from "mongoose";

export const register = async (
    req: Request,
     res: Response,
      next: NextFunction
    ) => {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword){
        return res.status(400).json({ message: 'email, password and confirmPassword are required' })
    }

    try {
        const checkData = await checkRegisterValidation({ email, password, confirmPassword })
        if (checkData !== true){
            errorHandler('Invalid Fields', 400, checkData);
        }

        if(password !== confirmPassword){
            return res.status(400)
                .json({ message: 'password and confirmPassword should be matched' })
        }

        const userDuplicate = await User.findOne({ email }).exec();
        if (userDuplicate) return res.status(409)
            .json({ message: 'This email already existed' });

        const hashPassword = await bcrypt.hash(password, 12);

        const result = await User.create({
            email: email,
            password: hashPassword
        });

        if (!result) {
            errorHandler('user was not created... Please try again');
        }
        res.status(201).json({ message: 'New User Created :)', user: { email } })
    } catch (error) {
        next(error)
    }
}

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, password } = req.body;
    if(!email || !password){
        return res.status(400).json({ message: 'email and password are required' })
    }

    try {
        const checkData = await checkLoginValidation({ email, password })
        if(checkData !== true) {
            errorHandler('Invalid Fields', 400, checkData)
        }
    
        const foundUser = await User.findOne({ email }).exec();
        if (!foundUser){
            res.status(400).json({ message: "User with this email was not found!" })
        }
    
        const match = await bcrypt.compare(password, foundUser!.password as string)
        if(!match){
            res.status(400).json({ message: 'Your password is wrong!' })
        }
    
        const accessToken = jwt.sign(
            { _id: foundUser!._id, role: foundUser!.role },
            process.env.ACCESS_TOKEN_SECRET?.toString()!,
            { expiresIn: '16m' }
        )
    
        const refreshToken = jwt.sign(
            { _id: foundUser!._id },
            process.env.REFRESH_TOKEN_SECRET?.toString()!,
            { expiresIn: '8d' }
        )
    
        foundUser!.refreshToken = refreshToken
        const result = await foundUser!.save()
        if(!result){
            errorHandler('User credential save was not Successfully... Try again')
        }

        res.cookie('jwt', refreshToken, {
            sameSite: 'none',
            httpOnly: true,
            // secure: '',
            maxAge: 8 * 24 * 60 * 60 * 1000 //8 day
        })

        res.status(200).json({ accessToken })
    } catch (error) {
        next(error)
    }
}

export const refresh = async (
    req: Request,
    res: Response, 
    next: NextFunction
) => {
    const cookies = req.cookies

    try {
        if (!cookies?.jwt){
            errorHandler('Unauthorized', 401)
        }
        const refreshToken = cookies.jwt
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET?.toString()!,
        ) as { _id: mongoose.Types.ObjectId }

        if (!decoded || !decoded._id){
            errorHandler('Forbidden', 403)
        }

        const foundUser = await User.findOne({ _id: decoded._id }).exec()
        if (!foundUser){
            errorHandler('Unauthorized', 401)
        }

        const accessToken = jwt.sign(
            { _id: foundUser!._id, role: foundUser!.role },
            process.env.ACCESS_TOKEN_SECRET?.toString()!,
            { expiresIn: "16m" }
        )

        res.status(200).json({ accessToken })
    } catch (error) {
        next(error)
    }
}

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const cookies = req.cookies
    if (!cookies?.jwt){
        return res.status(204)
    }
    const refreshToken = cookies.jwt

    try {
        // cookie in Db?
        const foundUser = await User.findOne({ refreshToken }).exec();
        if(!foundUser) {
            res.clearCookie('jwt', {
                httpOnly: true,
                sameSite: 'none',
                secure: true
            })
        }
        // Delete cookie in Db
        foundUser!.refreshToken = '';
        const result = await foundUser!.save()
        if(!result){
            errorHandler('cleared not success... Try again')
        }
        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: 'none',
            secure: true
        })
        res.status(200).json({ message: 'User logged out successfully... cookies cleared' })

    } catch (error) {
        next(error)
    }
}