import mongoose from 'mongoose';
import { IReview } from '../types/IReview';

const reviewModel = new mongoose.Schema<IReview>(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    depth: {
      type: Number,
      default: 1,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
    },
    commentText: {
      type: String,
      required: true,
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model('Review', reviewModel);
