"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPosts = exports.getLikedPostIds = exports.getLikedPosts = exports.getComments = exports.deletePost = exports.searchPosts = exports.likeOrUnlike = exports.postComment = exports.editPost = exports.uploadPost = exports.getPostById = exports.getPosts = void 0;
const Posts_1 = __importDefault(require("../models/Posts"));
const Users_1 = __importDefault(require("../models/Users"));
const Comments_1 = __importDefault(require("../models/Comments"));
const Notifications_1 = __importDefault(require("../models/Notifications"));
const firebase_1 = require("../firebase");
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield Posts_1.default.find();
        res.status(200).json(posts);
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
});
exports.getPosts = getPosts;
const getPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.post;
    try {
        const updatedPost = yield Posts_1.default.findOneAndUpdate({ _id: postId }, { $inc: { viewCount: +1 } }, { new: true });
        console.log("successfully viewed post");
        res.status(200).json(updatedPost);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getPostById = getPostById;
const uploadPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const post = Object.assign({}, req.body);
    const newPost = new Posts_1.default(post);
    console.log(newPost);
    try {
        yield newPost.save();
        res.status(201).json(newPost);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.uploadPost = uploadPost;
const editPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("edited post");
    const post = Object.assign({}, req.body);
    console.log(post);
    try {
        const updatedPost = yield Posts_1.default.findByIdAndUpdate(post.id, { $set: Object.assign({}, post) }, { new: true });
        console.log(updatedPost);
        res.status(201).send({ post: updatedPost });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.editPost = editPost;
const postComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.body.postId;
    const userId = req.body.userId;
    if (req.body.parent) {
        const parent = req.body.parent;
        const postedComment = req.body.reply;
        try {
            const post = yield Posts_1.default.findById(postId);
            const user = yield Users_1.default.findById(userId);
            const parentComment = yield Comments_1.default.findById(parent);
            if (post && user && parentComment) {
                const parentCommenter = yield Users_1.default.findById(parentComment.userId);
                const comment = new Comments_1.default({
                    postId: postId,
                    userId: userId,
                    avatar: user.avatar,
                    date: new Date(),
                    username: user.username,
                    comment: postedComment,
                    parent: parentComment,
                    level: parentComment.level + 1
                });
                yield comment.save();
                post.comments.push(comment);
                yield post.save();
                const creator = yield Users_1.default.findById(post.creator);
                if (creator) {
                    if (creator.notifications.length >= 20) {
                        while (creator.notifications.length >= 20) {
                            const notiId = creator.notifications.pop();
                            yield Notifications_1.default.findByIdAndDelete(notiId);
                        }
                    }
                    const notification = new Notifications_1.default({
                        userId: userId,
                        avatar: user.avatar,
                        date: comment.date,
                        message: `${user.username} commented: ${comment.comment}`,
                        postId: post._id,
                        image: post.image,
                        read: false
                    });
                    yield notification.save();
                    creator.notifications.unshift(notification);
                    yield creator.save();
                }
                if (parentCommenter) {
                    if (parentCommenter.notifications.length >= 20) {
                        while (parentCommenter.notifications.length >= 20) {
                            const notiId = parentCommenter.notifications.pop();
                            yield Notifications_1.default.findByIdAndDelete(notiId);
                        }
                    }
                    const notification = new Notifications_1.default({
                        userId: userId,
                        avatar: user.avatar,
                        date: comment.date,
                        message: `${user.username} replied to your comment: ${comment.comment}`,
                        postId: post._id,
                        image: post.image,
                        read: false
                    });
                    yield notification.save();
                    parentCommenter.notifications.unshift(notification);
                    yield parentCommenter.save();
                }
                const comments = yield Comments_1.default.find({
                    _id: { $in: post === null || post === void 0 ? void 0 : post.comments }
                });
                res.status(201).send({ post, comments });
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ message: err });
        }
    }
    else {
        try {
            const postedComment = req.body.comment;
            const post = yield Posts_1.default.findById(postId);
            const user = yield Users_1.default.findById(userId);
            if (post && user) {
                const comment = new Comments_1.default({
                    postId: postId,
                    userId: userId,
                    avatar: user.avatar,
                    date: new Date(),
                    username: user.username,
                    comment: postedComment
                });
                yield comment.save();
                post.comments.push(comment);
                yield post.save();
                const creator = yield Users_1.default.findById(post.creator);
                if (creator) {
                    if (creator.notifications.length >= 20) {
                        while (creator.notifications.length >= 20) {
                            const notiId = creator.notifications.pop();
                            yield Notifications_1.default.findByIdAndDelete(notiId);
                        }
                    }
                    const notification = new Notifications_1.default({
                        userId: userId,
                        avatar: user.avatar,
                        date: comment.date,
                        message: `${user.username} commented: ${comment.comment}`,
                        postId: post._id,
                        image: post.image,
                        read: false
                    });
                    yield notification.save();
                    creator.notifications.unshift(notification);
                    yield creator.save();
                }
                const comments = yield Comments_1.default.find({
                    _id: { $in: post === null || post === void 0 ? void 0 : post.comments }
                });
                res.status(201).send({ post, comments });
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ message: err });
        }
    }
});
exports.postComment = postComment;
//adding notifications: need to include liker's pfp, date of like, liker's username, liked post's image -- only for likes not for unlikes 
const likeOrUnlike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.body.postId;
    const userId = req.body.userId;
    try {
        const post = yield Posts_1.default.findById(postId);
        const user = yield Users_1.default.findById(userId);
        if (user && post) {
            if (user.likedPosts.includes(postId)) {
                console.log(user.likedPosts);
                user.likedPosts.splice(user.likedPosts.findIndex(post => post.toString() === postId), 1);
                console.log(user.likedPosts);
                yield user.save();
                console.log(post.likeCount);
                if (post.likeCount == 0) {
                    res.status(201).send({ user, post: post });
                }
                else {
                    const updatedPost = yield Posts_1.default.findOneAndUpdate({ _id: postId }, { $inc: { likeCount: -1 } }, { new: true });
                    res.status(201).send({ user, post: updatedPost });
                }
                console.log("successfully unliked post");
            }
            else {
                const creator = yield Users_1.default.findById(post.creator);
                if (creator) {
                    if (creator.notifications.length >= 20) {
                        while (creator.notifications.length >= 20) {
                            const notiId = creator.notifications.pop();
                            yield Notifications_1.default.findByIdAndDelete(notiId);
                        }
                    }
                    const notification = new Notifications_1.default({
                        userId: userId,
                        avatar: user.avatar,
                        date: new Date(),
                        message: `${user.username} liked your post!`,
                        postId: post._id,
                        image: post.image,
                        read: false
                    });
                    yield notification.save();
                    creator.notifications.unshift(notification);
                    yield creator.save();
                }
                user.likedPosts.push(post);
                yield user.save();
                const updatedPost = yield Posts_1.default.findOneAndUpdate({ _id: postId }, { $inc: { likeCount: +1 } }, { new: true });
                res.status(201).send({ user, post: updatedPost });
                console.log("successfully liked post");
            }
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: err });
    }
});
exports.likeOrUnlike = likeOrUnlike;
const searchPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const search = req.params.search;
        const pipeline = [
            {
                $search: {
                    index: 'default',
                    text: {
                        query: search,
                        path: ['title', 'category', 'github', 'website']
                    }
                }
            },
            {
                $limit: 50
            }
        ];
        const cursor = Posts_1.default.aggregate(pipeline);
        const results = yield cursor.exec();
        console.log(results);
        res.status(200).json(results);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: err });
    }
});
exports.searchPosts = searchPosts;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.post;
        const oldPost = yield Posts_1.default.findById(postId);
        if (oldPost) {
            const file = firebase_1.bucket.file(oldPost.name);
            file.delete().then(() => {
                console.log("Successful deletion of image");
            }).catch((err) => {
                console.error(err);
            });
        }
        const result = yield Posts_1.default.deleteOne({
            _id: postId
        });
        if (result.deletedCount == 1) {
            console.log("successfully deleted post");
            yield Comments_1.default.deleteMany({ postId: postId });
            yield Notifications_1.default.deleteMany({ postId: postId });
            const result = yield Users_1.default.updateMany({ likedPosts: postId }, { $pull: { likedPosts: postId } });
            res.status(201).send({ message: result });
        }
        else {
            res.status(500).send({ message: "error finding post to delete" });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
exports.deletePost = deletePost;
const getComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield Posts_1.default.findById(req.params.post);
        console.log(post);
        if (post) {
            const comments = yield Comments_1.default.find({
                _id: { $in: post === null || post === void 0 ? void 0 : post.comments }
            });
            res.status(201).send({ post, comments });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
exports.getComments = getComments;
const getLikedPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield Users_1.default.findById(req.params.user);
        const likedPosts = yield Posts_1.default.find({
            _id: { $in: user === null || user === void 0 ? void 0 : user.likedPosts },
        });
        res.status(201).json(likedPosts);
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
exports.getLikedPosts = getLikedPosts;
const getLikedPostIds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield Users_1.default.findById(req.params.user);
        res.status(201).json(user === null || user === void 0 ? void 0 : user.likedPosts);
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
exports.getLikedPostIds = getLikedPostIds;
const getUserPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield Posts_1.default.find({ creator: req.params.user }).sort({ date: -1 }).lean();
        res.status(200).send(posts);
    }
    catch (err) {
        res.status(500).json(err);
    }
});
exports.getUserPosts = getUserPosts;
