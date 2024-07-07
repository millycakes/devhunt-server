"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const PostSchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: "Comment",
        default: []
    },
    languages: [String],
    collab: {
        type: Number,
        required: true
    }
});
const Post = mongoose_1.default.model('posts', PostSchema);
exports.default = Post;
