import {Request, Response} from 'express';
import User from '../models/Users';
import Post from '../models/Posts';
import Comment from '../models/Comments';
import Notification from '../models/Notifications'

export const getUser = async(req: Request, res: Response) => {
	const username = req.params.user
	console.log(username)
	User.findOne({username: username})
	.then((user) => {
		console.log("user is", user)
		res.status(201).json(user)
	})
	.catch((err) => {
		console.log(err)
		res.status(500).json({ message: err });
	})
}

export const editProfile = async (req: Request, res: Response) => {
	const profileInfo = {...req.body}
	console.log(profileInfo)
	let k: keyof typeof profileInfo;
    for (k in profileInfo) {
        if (k === 'id'){
            delete profileInfo[k];
        }
    }
	const updatedUser = User.findOneAndUpdate(
    {_id: req.body.id}, 
    {$set: profileInfo}, 
    {new: true}
	)
	.then((updatedUser) => {
		console.log("updated user is ", updatedUser)
		res.status(201).json(updatedUser)
	})
	.catch((error) => {
		console.log(error);
		res.status(500).json({ message: error });
	});
}

export const deleteProfile = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = req.params.user;
        const user = await User.findById(userId);
		if (user) {
			const result = await User.deleteOne({
				_id: userId
			})
			if (result.deletedCount == 1){
				console.log("successfully deleted user");
			}
			const postIds = (await Post.find({ creator: userId }, '_id').exec()).map(doc => doc._id);
			console.log(postIds)
			const ans = await User.updateMany(
			{ likedPosts: { $in: postIds } },
			{ $pull: { likedPosts: { $in: postIds } } }
			);			
			console.log(ans)
			await Post.deleteMany({creator: userId})
			await Comment.deleteMany({userId: userId})
			await Notification.deleteMany({userId: userId})
			res.status(201).send({ message: "successfully deleted user" });
			} else {
			res.status(500).send({ message: "error finding user to delete" });
		}
	} catch (err) {
		console.log(err);
		res.status(500).json(err);
	}
};

export const getNotis =async (req: Request, res: Response): Promise<void> => {
	try {
        const user = await User.findById(req.params.user);
        const notis = await Notification.find({
            _id: { $in: user?.notifications },
        }).sort({ date: -1 });
        res.status(201).json(notis);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

export const readNoti = async (req: Request, res: Response): Promise<void> => {
	const notiId = req.body.notiId;
    const userId = req.body.userId;
	try {
		 const user = await User.findOne({ _id: userId });
        if (!user) {
            res.status(500).send({ message: "error finding user" });
            return;
		}
        const notification = await Notification.findById(notiId)
		if (notification) {
			notification.read = true
			await notification.save()
			const notis = await Notification.find({
				_id: { $in: user.notifications}
			}).sort({date: -1});
			res.status(201).send({notis: notis})
		}
		else {
			res.status(500).json({message: "error finding notification"})
		}
	} catch (err) {
		console.log(err)
		res.status(500).json(err)
	}
}