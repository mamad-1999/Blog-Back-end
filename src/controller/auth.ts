import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcrypt'
import checkValidation from '../validators/register';
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
        const checkData = await checkValidation({ email, password, confirmPassword })
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