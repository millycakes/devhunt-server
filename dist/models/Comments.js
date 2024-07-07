"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const CommentSchema = new mongoose_1.default.Schema({
    postId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    avatar: { type: String, required: true },
    date: { type: Date, required: true },
    username: { type: String, required: true },
    comment: { type: String, required: true },
    parent: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Comment' },
    level: { type: Number, default: 0 }
});
const Comment = mongoose_1.default.model('Comments', CommentSchema);
exports.default = Comment;
