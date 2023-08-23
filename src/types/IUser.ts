import { Types } from 'mongoose';

export type IUser = {
  email: string;
  password: string;
  name?: string;
  image?: string;
  phone?: string;
  biography?: string;
  role: 'user' | 'admin' | 'superAdmin';
  birthdayDate?: Date;
  gender?: 'male' | 'female' | 'other';
  twitterProfile?: string;
  linkedinProfile?: string;
  posts?: [Types.ObjectId];
  favoritesCategory: string[];
  favoritesPost: [Types.ObjectId];
  readingList: [Types.ObjectId];
  following: [Types.ObjectId];
  follower: [Types.ObjectId];
  blocked: [Types.ObjectId];
  refreshToken: string;
  createUserAt: Date;
};

export type IUpdateUser = {
  name?: string;
  image?: string;
  phone?: string;
  biography?: string;
  birthdayDate?: string;
  gender?: string;
  twitterProfile?: string;
  linkedinProfile?: string;
};
