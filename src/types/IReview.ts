import { Types } from 'mongoose';

export type IReview = {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  depth: number;
  parentId: Types.ObjectId;
  author: Types.ObjectId;
  commentText: string;
  children: Record<string, IReview>;
};

export type IAddReview = {
  commentText: string;
  parentId?: string;
  depth?: string;
  author?: Types.ObjectId;
  postId: string;
};
