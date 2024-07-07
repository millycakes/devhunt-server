"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: 'https://t4.ftcdn.net/jpg/00/64/67/27/360_F_64672736_U5kpdGs9keUll8CRQ3p3YaEv2M6qkVY5.jpg'
    },
    avatarName: {
        type: String
    },
    googleId: {
        type: Number
    },
    githubId: {
        type: Number
    },
    likedPosts: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: "Post",
        default: []
    },
    followers: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: "Post",
        default: []
    },
    following: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: "Post",
        default: []
    },
    about: String,
    publicEmail: String,
    github: String,
    website: String,
    username: String,
    languages: [String],
    reddit: String,
    linkedin: String,
    discord: String,
    notifications: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Notification',
            default: []
        }],
});
const User = mongoose_1.default.model('users', UserSchema);
exports.default = User;
