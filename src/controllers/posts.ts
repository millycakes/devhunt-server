import { Request, Response } from 'express';
import Post from "../models/Posts";
import User from '../models/Users';
import Comment from '../models/Comments'
import Notification from '../models/Notifications'
import { bucket } from '../firebase'

export const getPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
}

export const getPostById = async (req: Request, res: Response): Promise<void> => {
    console.log("made it here?")
    const postId = req.params.post;
    console.log(postId)
    try {
        const updatedPost = await Post.findOneAndUpdate( 
            {_id: postId}, 
            {$inc: { viewCount: +1 } },
            {new: true}
        );
        console.log("successfully viewed post")
        res.status(200).json(updatedPost);
    } catch (error: any) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
}

export const uploadPost = async (req: Request, res: Response): Promise<void> => {
    const post = {...req.body};
    const newPost = new Post(post);
    console.log(newPost)
    try {
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const editPost = async(req: Request, res: Response): Promise<void> => {
    console.log("edited post")
    const post = {...req.body};
    console.log(post)
    try {
        const updatedPost = await Post.findByIdAndUpdate(
            post.id,
            {$set: {...post} },
            {new: true}
        );
        console.log(updatedPost)
        res.status(201).send({post: updatedPost})
    } catch(error:any) {
        res.status(500).json({message: error.message})
    }
}

export const postComment = async(req: Request, res: Response): Promise<void> => {
    const postId = req.body.postId;
    const userId = req.body.userId;
    if (req.body.parent) {
        const parent = req.body.parent;
        const postedComment = req.body.reply;
        try {
            const post = await Post.findById(postId);
            const user = await User.findById(userId);
            const parentComment = await Comment.findById(parent);
            
            if (post && user && parentComment) {
                const parentCommenter = await User.findById(parentComment.userId)
                const comment = new Comment({
                    postId: postId,
                    userId: userId,
                    avatar: user.avatar,
                    date: new Date(),
                    username: user.username,
                    comment: postedComment,
                    parent: parentComment,
                    level: parentComment.level+1
                })
                await comment.save()
                post.comments.push(comment)
                await post.save()

                const creator = await User.findById(post.creator)
                if (creator) {
                    if (creator.notifications.length >= 20) {
                            while (creator.notifications.length>=20) {
                                const notiId = creator.notifications.pop()
                                await Notification.findByIdAndDelete(notiId)
                            }
                        }
                        const notification = new Notification({
                            userId: userId,
                            avatar: user.avatar,
                            date: comment.date,
                            message: `${user.username} commented: ${comment.comment}`,
                            postId: post._id,
                            image: post.image,
                            read: false
                        })
                        await notification.save()
                        creator.notifications.unshift(notification);
                        await creator.save()
                }
                if (parentCommenter) {
                    if (parentCommenter.notifications.length >= 20) {
                            while (parentCommenter.notifications.length>=20) {
                                const notiId = parentCommenter.notifications.pop()
                                await Notification.findByIdAndDelete(notiId)
                            }
                        }
                        const notification = new Notification({
                            userId: userId,
                            avatar: user.avatar,
                            date: comment.date,
                            message: `${user.username} replied to your comment: ${comment.comment}`,
                            postId: post._id,
                            image: post.image,
                            read: false
                        })
                        await notification.save()
                        parentCommenter.notifications.unshift(notification);
                        await parentCommenter.save()
                }
                const comments = await Comment.find({
                    _id: {$in: post?.comments}
                })
                res.status(201).send({post, comments})
            }
        }
        catch (err) {
            console.log(err)
            res.status(500).json({message:err})
        }
    }  
    else {
        try {
            const postedComment = req.body.comment;
            const post = await Post.findById(postId);
            const user = await User.findById(userId)

            if (post && user) {
                const comment = new Comment({
                    postId: postId,
                    userId: userId,
                    avatar: user.avatar,
                    date: new Date(),
                    username: user.username,
                    comment: postedComment
                })
                await comment.save()
                post.comments.push(comment)
                await post.save()

                const creator = await User.findById(post.creator)
                if (creator) {
                    if (creator.notifications.length >= 20) {
                            while (creator.notifications.length>=20) {
                                const notiId = creator.notifications.pop()
                                await Notification.findByIdAndDelete(notiId)
                            }
                        }
                        const notification = new Notification({
                            userId: userId,
                            avatar: user.avatar,
                            date: comment.date,
                            message: `${user.username} commented: ${comment.comment}`,
                            postId: post._id,
                            image: post.image,
                            read: false
                        })
                        await notification.save()
                        creator.notifications.unshift(notification);
                        await creator.save()
                }
                const comments = await Comment.find({
                    _id: {$in: post?.comments}
                });
                res.status(201).send({post, comments})
            }
        }
        catch (err) {
            console.log(err)
            res.status(500).json({message:err})
        }
    }
}

//adding notifications: need to include liker's pfp, date of like, liker's username, liked post's image -- only for likes not for unlikes 
export const likeOrUnlike = async (req: Request, res: Response): Promise<void> => {
    const postId = req.body.postId;
    const userId = req.body.userId;

    try {
        const post = await Post.findById(postId);
        const user = await User.findById(userId);
        if (user && post){
            if (user.likedPosts.includes(postId)) {
                console.log(user.likedPosts)
                user.likedPosts.splice(user.likedPosts.findIndex(post => post.toString() === postId),1);
                console.log(user.likedPosts)
                await user.save();
                console.log(post.likeCount)
                if (post.likeCount==0) {
                    res.status(201).send({user, post: post})
                }
                else {
                    const updatedPost = await Post.findOneAndUpdate( 
                    {_id: postId}, 
                    {$inc: { likeCount: -1 } },
                    {new: true}
                    );
                    res.status(201).send({user, post: updatedPost})
                }
                console.log("successfully unliked post");
            }
            else {
                const creator = await User.findById(post.creator)
                if (creator) {
                    if (creator.notifications.length >= 20) {
                        while (creator.notifications.length>=20) {
                            const notiId = creator.notifications.pop()
                            await Notification.findByIdAndDelete(notiId)
                        }
                    }
                    const notification = new Notification({
                        userId: userId,
                        avatar: user.avatar,
                        date: new Date(),
                        message: `${user.username} liked your post!`,
                        postId: post._id,
                        image: post.image,
                        read: false
                    })
                    await notification.save()
                    creator.notifications.unshift(notification);
                    await creator.save()
                }
                user.likedPosts.push(post);
                await user.save();
                const updatedPost = await Post.findOneAndUpdate( 
                    {_id: postId}, 
                    {$inc: { likeCount: +1 } },
                    {new: true}
                );
                res.status(201).send({user, post: updatedPost})
                console.log("successfully liked post");
            }
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err});
    }
}

export const searchPosts = async(req: Request, res: Response): Promise<void> => {
    try {
        const search = req.params.search
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
        ]
        const cursor = Post.aggregate(pipeline)
        const results = await cursor.exec()
        console.log(results)
        res.status(200).json(results)
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err})
    }
}

export const deletePost = async (req: Request, res: Response): Promise<void>=> {
    try {
        const postId = req.params.post;
        const oldPost = await Post.findById(postId);
        if (oldPost) {
            const file = bucket.file(oldPost.name);
            file.delete().then(() => {
                console.log("Successful deletion of image");
            }).catch((err) => {
                console.error(err);
        });
        }
        const result = await Post.deleteOne({
            _id: postId
        })
        if (result.deletedCount==1) {
            console.log("successfully deleted post")
            await Comment.deleteMany (
                {postId: postId}
            )
            await Notification.deleteMany (
                {postId: postId}
            )
            const result = await User.updateMany(
                {likedPosts: postId},
                {$pull:{likedPosts: postId}}
            )
            res.status(201).send({message: result})
        }
        else {
            res.status(500).send({message:"error finding post to delete"})
        }
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

export const getComments = async(req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.params.post);
        console.log(post)
        if (post) {
            const comments = await Comment.find({
                _id: {$in: post?.comments}
            })
            res.status(201).send({post, comments})
        }
    }
    catch(err) {
        console.log(err);
        res.status(500).json(err);
    }
}

export const getLikedPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.user);
        const likedPosts = await Post.find({
            _id: { $in: user?.likedPosts },
        });
        res.status(201).json(likedPosts);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

export const getLikedPostIds = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.user);
        res.status(201).json(user?.likedPosts);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

export const getUserPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const posts = await Post.find({creator: req.params.user}).sort({date: -1}).lean();
        res.status(200).send(posts);
    }
    catch (err) {
        res.status(500).json(err);
    }
}