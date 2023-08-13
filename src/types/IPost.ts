import { Types } from 'mongoose';

export type IPost = {
  title: string;
  image: string;
  description: string;
  userId: Types.ObjectId;
  reviews: [Types.ObjectId];
  likesCount: number;
  tags: [string];
};

export type IAddPost = {
  title: string;
  description: string;
  tags?: [string];
};

export interface PostFilters {
  title?: {
    $regex: RegExp;
  };
}
