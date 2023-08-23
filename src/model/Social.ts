import mongoose from 'mongoose';
import { ISocial } from '../types/ISocial';

const socialModel = new mongoose.Schema<ISocial>({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
  },
  profileUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

export default mongoose.model<ISocial>('Social', socialModel);
