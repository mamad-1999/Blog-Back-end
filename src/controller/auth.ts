import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import checkRegisterValidation from '../validators/register';
import checkLoginValidation from '../validators/login';
import checkSocialValidation from '../validators/social';
import checkChangePasswordValidation from '../validators/changePassword';
import errorHandler from '../utils/errorHandler';
import User from '../model/User';
import mongoose from 'mongoose';
import env from '../utils/env';
import Social from '../model/Social';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return res.status(400).json({
      message: 'email, password and confirmPassword are required',
    });
  }

  try {
    const checkData = await checkRegisterValidation({
      email,
      password,
      confirmPassword,
    });
    if (checkData !== true) {
      errorHandler('Invalid Fields', 400, checkData);
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'password and confirmPassword should be matched',
      });
    }

    const userDuplicate = await User.findOne({
      email,
    }).exec();
    if (userDuplicate)
      return res.status(409).json({
        message: 'This email already existed',
      });

    const hashPassword = await bcrypt.hash(password, 12);

    const result = await User.create({
      email: email,
      password: hashPassword,
    });

    if (!result) {
      errorHandler('user was not created... Please try again');
    }
    res.status(201).json({
      message: 'New User Created :)',
      user: { email },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: 'email and password are required',
    });
  }

  try {
    const checkData = await checkLoginValidation({
      email,
      password,
    });
    if (checkData !== true) {
      errorHandler('Invalid Fields', 400, checkData);
    }

    const foundUser = await User.findOne({
      email,
    }).exec();
    if (!foundUser) {
      res.status(400).json({
        message: 'User with this email was not found!',
      });
    }

    const match = await bcrypt.compare(password, foundUser!.password as string);
    if (!match) {
      res.status(400).json({
        message: 'Your password is wrong!',
      });
    }

    const accessToken = jwt.sign(
      {
        _id: foundUser!._id,
        role: foundUser!.role,
      },
      env.ACCESS_TOKEN_SECRET,
      { expiresIn: '6d' },
    );

    const refreshToken = jwt.sign({ _id: foundUser!._id }, env.REFRESH_TOKEN_SECRET, {
      expiresIn: '8d',
    });

    foundUser!.refreshToken = refreshToken;
    const result = await foundUser!.save();
    if (!result) {
      errorHandler('User credential save was not Successfully... Try again');
    }

    res.cookie('jwt', refreshToken, {
      sameSite: 'none',
      httpOnly: true,
      // secure: '',
      maxAge: 8 * 24 * 60 * 60 * 1000, //8 day
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  const cookies = req.cookies;

  try {
    if (!cookies?.jwt) {
      errorHandler('Unauthorized', 401);
    }
    const refreshToken = cookies.jwt;
    const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as {
      _id: mongoose.Types.ObjectId;
    };

    if (!decoded || !decoded._id) {
      errorHandler('Forbidden', 403);
    }

    const foundUser = await User.findOne({
      _id: decoded._id,
    }).exec();
    if (!foundUser) {
      errorHandler('Unauthorized', 401);
    }

    const accessToken = jwt.sign(
      {
        _id: foundUser!._id,
        role: foundUser!.role,
      },
      env.ACCESS_TOKEN_SECRET,
      { expiresIn: '6d' },
    );

    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(204);
  }
  const refreshToken = cookies.jwt;

  try {
    // cookie in Db?
    const foundUser = await User.findOne({
      refreshToken,
    }).exec();
    if (!foundUser) {
      res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
    }
    // Delete cookie in Db
    foundUser!.refreshToken = '';
    const result = await foundUser!.save();
    if (!result) {
      errorHandler('cleared not success... Try again');
    }
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    res.status(200).json({
      message: 'User logged out successfully... cookies cleared',
    });
  } catch (error) {
    next(error);
  }
};

export const socialLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, profileUrl } = req.body;
    if (!username || !email || !profileUrl) {
      return res
        .status(400)
        .json({ message: 'Your data is not valid, Please resend valid data' });
    }

    const checkData = await checkSocialValidation({ ...req.body });
    if (checkData !== true) {
      return res.status(400).json({ message: 'Input invalid', checkData });
    }

    const foundUser = await User.findOne({ email: email });
    if (!foundUser) {
      const newUser = await User.create({
        email: email,
        name: username,
        image: profileUrl,
      });

      await Social.create({ username, profileUrl, userId: newUser._id });
    }

    const accessToken = jwt.sign(
      {
        _id: foundUser!._id,
        role: foundUser!.role,
      },
      env.ACCESS_TOKEN_SECRET,
      { expiresIn: '6d' },
    );

    const refreshToken = jwt.sign({ _id: foundUser!._id }, env.REFRESH_TOKEN_SECRET, {
      expiresIn: '8d',
    });

    foundUser!.refreshToken = refreshToken;
    const result = await foundUser!.save();
    if (!result) {
      errorHandler('User credential save was not Successfully... Try again');
    }

    res.cookie('jwt', refreshToken, {
      sameSite: 'none',
      httpOnly: true,
      // secure: '',
      maxAge: 8 * 24 * 60 * 60 * 1000, //8 day
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({
      message: 'currentPassword, newPassword and confirmNewPassword are required',
    });
  }

  try {
    const checkData = await checkChangePasswordValidation({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
    if (checkData !== true) {
      errorHandler('Invalid Fields', 400, checkData);
    }

    const foundUser = await User.findOne({ _id: req.user })
      .select('-refreshToken')
      .exec();

    if (!foundUser) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    const match = await bcrypt.compare(currentPassword, foundUser!.password as string);
    if (!match) {
      return res.status(400).json({
        message: 'Sorry, Your current Password is Wrong!',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res
        .status(400)
        .json({ message: 'Your newPassword and confirmPassword is not Match' });
    }

    const hashPassword = await bcrypt.hash(newPassword, 12);

    const result = await User.findByIdAndUpdate(req.user, {
      $set: { password: hashPassword },
    });

    if (!result) {
      return res
        .status(500)
        .json({ message: 'Sorry, something Wrong. Please try again' });
    }

    const accessToken = jwt.sign(
      {
        _id: foundUser!._id,
        role: foundUser!.role,
      },
      env.ACCESS_TOKEN_SECRET,
      { expiresIn: '6d' },
    );

    return res
      .status(200)
      .json({ message: 'Your Password Successfully Changed!', token: accessToken });
  } catch (error) {
    next(error);
  }
};
