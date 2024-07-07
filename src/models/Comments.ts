import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
    postId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    avatar: string;
    date: Date;
    username: string;
    comment: string;
    parent: mongoose.Types.ObjectId;
    level: number;
}

const CommentSchema: Schema = new mongoose.Schema<IComment>({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    avatar: { type: String, required: true },
    date: { type: Date, required: true },
    username: { type: String, required: true },
    comment: { type: String, required: true },
    parent: {type: mongoose.Schema.Types.ObjectId, ref: 'Comment'},
    level: {type: Number, default: 0}
});

const Comment = mongoose.model<IComment>('Comments', CommentSchema);
export default Comment;