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
exports.readNoti = exports.getNotis = exports.deleteProfile = exports.editProfile = exports.getUser = void 0;
const Users_1 = __importDefault(require("../models/Users"));
const Posts_1 = __importDefault(require("../models/Posts"));
const Comments_1 = __importDefault(require("../models/Comments"));
const Notifications_1 = __importDefault(require("../models/Notifications"));
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.params.user;
    console.log(username);
    Users_1.default.findOne({ username: username })
        .then((user) => {
        console.log("user is", user);
        res.status(201).json(user);
    })
        .catch((err) => {
        console.log(err);
        res.status(500).json({ message: err });
    });
});
exports.getUser = getUser;
const editProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profileInfo = Object.assign({}, req.body);
    console.log(profileInfo);
    let k;
    for (k in profileInfo) {
        if (k === 'id') {
            delete profileInfo[k];
        }
    }
    const updatedUser = Users_1.default.findOneAndUpdate({ _id: req.body.id }, { $set: profileInfo }, { new: true })
        .then((updatedUser) => {
        console.log("updated user is ", updatedUser);
        res.status(201).json(updatedUser);
    })
        .catch((error) => {
        console.log(error);
        res.status(500).json({ message: error });
    });
});
exports.editProfile = editProfile;
const deleteProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.user;
        const user = yield Users_1.default.findById(userId);
        if (user) {
            const result = yield Users_1.default.deleteOne({
                _id: userId
            });
            if (result.deletedCount == 1) {
                console.log("successfully deleted user");
            }
            const postIds = (yield Posts_1.default.find({ creator: userId }, '_id').exec()).map(doc => doc._id);
            console.log(postIds);
            const ans = yield Users_1.default.updateMany({ likedPosts: { $in: postIds } }, { $pull: { likedPosts: { $in: postIds } } });
            console.log(ans);
            yield Posts_1.default.deleteMany({ creator: userId });
            yield Comments_1.default.deleteMany({ userId: userId });
            yield Notifications_1.default.deleteMany({ userId: userId });
            res.status(201).send({ message: "successfully deleted user" });
        }
        else {
            res.status(500).send({ message: "error finding user to delete" });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
exports.deleteProfile = deleteProfile;
const getNotis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield Users_1.default.findById(req.params.user);
        const notis = yield Notifications_1.default.find({
            _id: { $in: user === null || user === void 0 ? void 0 : user.notifications },
        }).sort({ date: -1 });
        res.status(201).json(notis);
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
exports.getNotis = getNotis;
const readNoti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const notiId = req.body.notiId;
    const userId = req.body.userId;
    try {
        const user = yield Users_1.default.findOne({ _id: userId });
        if (!user) {
            res.status(500).send({ message: "error finding user" });
            return;
        }
        const notification = yield Notifications_1.default.findById(notiId);
        if (notification) {
            notification.read = true;
            yield notification.save();
            const notis = yield Notifications_1.default.find({
                _id: { $in: user.notifications }
            }).sort({ date: -1 });
            res.status(201).send({ notis: notis });
        }
        else {
            res.status(500).json({ message: "error finding notification" });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
exports.readNoti = readNoti;
