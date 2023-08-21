import mongoose from 'mongoose';
import User from '../model/User';

const checkUserBlocked = async (
  userId: mongoose.Types.ObjectId | string,
  currentUser: mongoose.Types.ObjectId,
) => {
  try {
    const user = await User.findById(userId).select('blocked').exec();

    if (!user) {
      throw new Error('User not found');
    }
    if (user?.blocked.includes(currentUser)) {
      return true;
    }

    return false;
  } catch (error) {
    throw Error(`Failed to check if user is blocked: ${error}`);
  }
};

export default checkUserBlocked;
