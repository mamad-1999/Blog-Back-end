import { Request, Response, NextFunction } from 'express';
import User from '../model/User';

type Role = 'user' | 'admin' | 'superAdmin';

const verifyRole = (role: Role) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const foundUser = await User.findById(req.user).lean().exec();
      console.log(req.user);
      if (!foundUser) {
        return res.status(403).json({ message: 'Forbidden... User not found' });
      }
      if (
        foundUser!.role === role ||
        ((role === 'user' || role === 'admin') && foundUser!.role === 'superAdmin')
      ) {
        next();
      } else {
        return res.status(403).json({ message: 'Forbidden...' });
      }
    } catch (error) {
      next(error);
    }
  };
};

export default verifyRole;
