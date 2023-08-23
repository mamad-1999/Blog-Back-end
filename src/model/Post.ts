import mongoose from 'mongoose';
import { IPost } from '../types/IPost';

const postModel = new mongoose.Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      maxlength: 40,
      minlength: 3,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
    },
    image: {
      type: String,
      required: true,
    },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    reviews: [{ type: mongoose.Types.ObjectId, ref: 'Review' }],
    tags: {
      type: [String],
    },
    postedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model('Post', postModel);
