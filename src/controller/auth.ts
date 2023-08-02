import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import checkRegisterValidation from '../validators/register';
import checkLoginValidation from '../validators/login';
import errorHandler from "../utils/errorHandler";
import User from "../model/User";

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
            { email: foundUser!.email, role: foundUser!.role },
            process.env.ACCESS_TOKEN_SECRET?.toString()!,
            { expiresIn: '16m' }
        )
    
        const refreshToken = jwt.sign(
            { email: foundUser!.email },
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