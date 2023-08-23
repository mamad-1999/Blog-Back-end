import mongoose from 'mongoose';
import { IReview } from '../types/IReview';
import Post from './Post';

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
    postedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// When user blocked this middleware is deleting reviews
reviewModel.pre('deleteMany', { document: false, query: true }, async function (next) {
  const reviewsToDelete = await this.model.find(this.getQuery());

  // Remove the review IDs from the corresponding posts
  await Post.updateMany(
    { reviews: { $in: reviewsToDelete.map((review) => review._id) } },
    { $pull: { reviews: { $in: reviewsToDelete.map((review) => review._id) } } },
  );

  next();
});

export default mongoose.model<IReview>('Review', reviewModel);
