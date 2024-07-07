import mongoose, { Document, Schema } from 'mongoose';
import {IComment} from './Comments'

export interface IPost extends Document {
    title: string;
    image: string;
    name: string;
    category: string;
    creator: mongoose.Schema.Types.ObjectId;
    creatorAvatar: string;
    creatorUsername: string;
    github: string;
    website: string;
    viewCount: number;
    likeCount: number;
    createdAt: Date;
    description: string;
    comments: Array<IComment>;
    languages: string[];
    collab: number;
}

const PostSchema: Schema = new mongoose.Schema<IPost>({
    title: { 
        type: String, 
        required: true 
    },
    image: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    creator: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    creatorUsername: {
        type: String,
        required: true
    },
    creatorAvatar: {
        type: String,
        default: 'https://t4.ftcdn.net/jpg/00/64/67/27/360_F_64672736_U5kpdGs9keUll8CRQ3p3YaEv2M6qkVY5.jpg'
    },
    github: { 
        type: String, 
        required: true 
    },
    website: String,
    viewCount: {
        type: Number,
        default: 0
    },
    likeCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    description: {
        type: String,
    },
    comments: {
        type: [mongoose.Schema.Types.ObjectId], 
        ref: "Comment",
        default: []
    },
    languages: [String],
    collab: {
        type: Number,
        required: true
    }
});

const Post = mongoose.model<IPost>('posts', PostSchema);
export default Post;