import mongoose from "mongoose";
import { IPost } from "../types/IPost";

const postModel = new mongoose.Schema<IPost>({
    title: {
        type: String,
        required: true,
        maxlength: 40,
        minlength: 3
    },
    description: {
        type: String,
        required: true,
        minlength: 10
    },
    image: {
        type: String,
        required: true
    },
    likesCount: {
        type: Number,
        default: 0
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    reviews: [{ type: mongoose.Types.ObjectId, ref: 'Review' }],
    tags: {
        type: [String],
    }
}) 

export default mongoose.model('Post', postModel)