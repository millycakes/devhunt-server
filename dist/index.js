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
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
require("./config/config");
require("./config/passport");
const firebase_1 = require("./firebase");
const cookieSession = require('cookie-session');
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const posts_1 = __importDefault(require("./routes/posts"));
const auth_1 = __importDefault(require("./routes/auth"));
const profile_1 = __importDefault(require("./routes/profile"));
const storage_1 = require("firebase-admin/storage");
const app = (0, express_1.default)();
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(express_1.default.static('public'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookieSession({
    name: 'session',
    keys: ['devhunt'],
    maxAge: 30 * 24 * 60 * 60 * 100,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((0, cors_1.default)({
    origin: 'https://devhunt-server-e141054a4ce8.herokuapp.com/',
    credentials: true,
    methods: 'GET,POST,PUT,DELETE',
}));
app.use('/auth', auth_1.default);
app.use('/posts', posts_1.default);
app.use('/profile', profile_1.default);
const Posts_1 = __importDefault(require("./models/Posts"));
const Users_1 = __importDefault(require("./models/Users"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
app.post('/upload', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    if (req.file) {
        console.log("uploading with file");
        const filename = req.file.fieldname + "_" + Date.now() + path_1.default.extname(req.file.originalname);
        const file = firebase_1.bucket.file(filename);
        file.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype },
        }, (error) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: error.message });
            }
            const url = yield (0, storage_1.getDownloadURL)(file);
            const post = JSON.parse(req.body.data);
            post.image = url;
            post.name = filename;
            post.createdAt = new Date();
            const newPost = new Posts_1.default(post);
            try {
                yield newPost.save();
                console.log(newPost);
                res.status(201).json(newPost);
            }
            catch (error) {
                res.status(409).json({ message: error.message });
            }
        }));
    }
    else {
        res.status(500).json({ message: "User needs to upload an image." });
    }
}));
app.post('/editWithPicture', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.file) {
        console.log("editing with picture");
        const filename = req.file.fieldname + "_" + Date.now() + path_1.default.extname(req.file.originalname);
        const file = firebase_1.bucket.file(filename);
        file.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype },
        }, (error) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: error.message });
            }
            const url = yield (0, storage_1.getDownloadURL)(file);
            const post = JSON.parse(req.body.data);
            post.image = url;
            post.name = filename;
            const oldPost = yield Posts_1.default.findById(post.id);
            if (oldPost) {
                const file = firebase_1.bucket.file(oldPost.name);
                file.delete().then(() => {
                    console.log("Successful deletion");
                }).catch((err) => {
                    console.error(err);
                });
            }
            try {
                const newPost = yield Posts_1.default.findByIdAndUpdate(post.id, { $set: Object.assign({}, post) }, { new: true });
                console.log(newPost);
                res.status(201).send({ post: newPost });
            }
            catch (error) {
                res.status(409).json({ message: error.message });
            }
        }));
    }
    else {
        res.redirect('https://devhunt-server-e141054a4ce8.herokuapp/editNoPicture');
    }
}));
app.post('/editProfile', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.file) {
        const filename = "user/" + req.file.fieldname + "_" + Date.now() + path_1.default.extname(req.file.originalname);
        const file = firebase_1.bucket.file(filename);
        file.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype },
        }, (error) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: error.message });
            }
            const url = yield (0, storage_1.getDownloadURL)(file);
            const user = JSON.parse(req.body.data);
            const id = user.id;
            user.avatar = url;
            user.avatarName = filename;
            const oldUser = yield Users_1.default.findById(id);
            if (oldUser && oldUser.avatarName) {
                const file = firebase_1.bucket.file(oldUser.avatarName);
                if (file) {
                    file.delete().then(() => {
                        console.log("Successful deletion");
                    }).catch((err) => {
                        console.log(err);
                    });
                }
            }
            const result = yield Posts_1.default.updateMany({ creator: id }, { $set: { creatorAvatar: url } });
            let k;
            for (k in user) {
                if (k === 'id') {
                    delete user[k];
                }
            }
            try {
                const newUser = yield Users_1.default.findOneAndUpdate({ _id: id, }, { $set: Object.assign({}, user) }, { new: true });
                console.log("this is the new user", newUser);
                res.status(201).send({ user: newUser });
            }
            catch (error) {
                res.status(409).json({ message: error.message });
            }
        }));
    }
}));
const PORT = process.env.PORT || 4000;
mongoose_1.default.connect(process.env.DSN || '')
    .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
    .catch((error) => console.error(error.message));
