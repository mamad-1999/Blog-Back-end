import mongoose from 'mongoose';
import User from '../model/User';

const checkUserBlocked = async (
  userId: mongoose.Types.ObjectId,
  currentUser: mongoose.Types.ObjectId,
) => {
  try {
    const userA = await User.findById(userId).select('blocked').exec();
    if (!userA) {
      throw new Error('User not found');
    }

    const userB = await User.findById(currentUser).select('blocked').exec();
    if (!userB) {
      throw new Error('User not found');
    }

    if (userA?.blocked.includes(currentUser) || userB?.blocked.includes(userId)) {
      return true;
    }

    return false;
  } catch (error) {
    throw Error(`Failed to check if user is blocked: ${error}`);
  }
};

export default checkUserBlocked;
