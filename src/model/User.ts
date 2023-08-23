import mongoose from 'mongoose';
import { IUser } from '../types/IUser';

const userModel = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 255,
    },
    name: {
      type: String,
      minlength: 2,
      maxlength: 30,
    },
    image: { type: String },
    biography: {
      type: String,
      maxlength: 255,
    },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    phone: {
      type: String,
      minlength: 10,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superAdmin'],
      default: 'user',
    },
    birthdayDate: {
      type: Date,
    },
    linkedinProfile: { type: String },
    twitterProfile: { type: String },
    posts: [{ type: mongoose.Types.ObjectId, ref: 'Post' }],
    favoritesCategory: { type: [String] },
    favoritesPost: [{ type: mongoose.Types.ObjectId, ref: 'Post' }],
    readingList: [{ type: mongoose.Types.ObjectId, ref: 'Post' }],
    following: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    follower: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    blocked: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    refreshToken: { type: String },
    createUserAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>('User', userModel);
