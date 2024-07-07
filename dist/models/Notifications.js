"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const NotificationSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    avatar: { type: String, required: true },
    date: { type: Date, required: true },
    message: { type: String, required: true },
    postId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Post', required: true },
    image: { type: String, required: true },
    read: { type: Boolean, default: false }
});
const Notification = mongoose_1.default.model('Notification', NotificationSchema);
exports.default = Notification;
