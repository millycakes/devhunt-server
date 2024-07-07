import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    avatar: string;
    date: Date;
    message: string;
    postId: mongoose.Types.ObjectId;
    image: string;
    read: boolean;
}

const NotificationSchema: Schema = new mongoose.Schema<INotification>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    avatar: { type: String, required: true },
    date: { type: Date, required: true },
    message: { type: String, required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    image: { type: String, required: true },
    read: { type: Boolean, default: false }
});

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
