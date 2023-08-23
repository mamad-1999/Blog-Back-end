import { Types } from 'mongoose';

export type ISocial = {
  username: string;
  profileUrl: string;
  userId: Types.ObjectId;
};
