import { Types } from 'mongoose';

export type IReview = {
  postId: Types.ObjectId;
  depth: number;
  parentId: Types.ObjectId;
  postedDate: Date;
  author: Types.ObjectId;
  commentText: string;
};

export type IAddReview = {
  commentText: string;
  parentId?: string;
  depth?: string;
  author?: Types.ObjectId;
};
