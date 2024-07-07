import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import './config/config';
import './config/passport';
import { bucket } from './firebase'
const cookieSession = require('cookie-session');
import multer from 'multer';
import path from 'path';
import postRoutes from './routes/posts';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile'

import { getDownloadURL } from 'firebase-admin/storage';


import { Request, Response } from 'express';

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
	cookieSession({
		name: 'session',
		keys: ['devhunt'],
		maxAge: 30 * 24 * 60 * 60 * 100,
	})
);
app.use(passport.initialize());
app.use(passport.session())
app.use(cors({
    origin: 'https://devhunt-server-e141054a4ce8.herokuapp.com/',
    credentials: true,
    methods: 'GET,POST,PUT,DELETE',
}))

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/profile', profileRoutes);

import Post from './models/Posts';
import User from './models/Users';

const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload', upload.single('file'), async (req, res) => {
    console.log(req.body);
    if (req.file) {
        console.log("uploading with file");
        const filename = req.file.fieldname + "_" + Date.now() + path.extname(req.file.originalname);
        const file = bucket.file(filename);
        file.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype },
        }, async (error: any) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: error.message });
            }

            const url = await getDownloadURL(file)
            const post = JSON.parse(req.body.data);
            post.image = url;
            post.name = filename;
            post.createdAt = new Date();
            const newPost = new Post(post);
            try {
                await newPost.save();
                console.log(newPost)
                res.status(201).json(newPost);
            } catch (error: any) {
                res.status(409).json({ message: error.message });
            }
        });
    } else {
        res.status(500).json({ message: "User needs to upload an image." });
    }
});

app.post('/editWithPicture', upload.single('file'), async (req, res) => {
    if (req.file) {
        console.log("editing with picture")
        const filename = req.file.fieldname+"_"+Date.now()+path.extname(req.file.originalname)
        const file = bucket.file(filename);
        file.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype },
        }, async (error: any) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: error.message });
            }
            const url = await getDownloadURL(file)
            const post = JSON.parse(req.body.data);
            post.image = url;
            post.name = filename;
            const oldPost = await Post.findById(post.id);
                if (oldPost) {
                    const file = bucket.file(oldPost.name);
                    file.delete().then(() => {
                        console.log("Successful deletion");
                    }).catch((err) => {
                        console.error(err);
                });
            }
            try {
                const newPost = await Post.findByIdAndUpdate(post.id, { $set: {...post}}, { new: true });
                console.log(newPost)
                res.status(201).send({post: newPost})
            } catch (error: any) {
                res.status(409).json({ message: error.message });
            }
        });
    }
    else {
        res.redirect('http://localhost:4000/editNoPicture')
    }
})

app.post('/editProfile', upload.single('file'), async(req,res) => {
    if (req.file) {
        const filename = "user/"+req.file.fieldname+"_"+Date.now()+path.extname(req.file.originalname)
        const file = bucket.file(filename);
        file.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype },
        }, async (error: any) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: error.message });
            }
            const url = await getDownloadURL(file)
            const user = JSON.parse(req.body.data);
            const id = user.id;
            user.avatar = url;
            user.avatarName = filename;
            const oldUser = await User.findById(id);
            if (oldUser && oldUser.avatarName) {
                const file = bucket.file(oldUser.avatarName);
                if (file) {
                    file.delete().then(() => {
                        console.log("Successful deletion");
                    }).catch((err) => {
                        console.log(err);
                    });
                }
            }
            const result = await Post.updateMany(
            { creator: id },
            { $set: { creatorAvatar: url } }
            );
            let k: keyof typeof user;
            for (k in user) {
                if (k === 'id'){
                    delete user[k];
                }
            }
            try {
                const newUser = await User.findOneAndUpdate({_id: id,}, { $set: {...user}}, { new: true });
                console.log("this is the new user", newUser)
                res.status(201).send({user: newUser})
            } catch (error: any) {
                res.status(409).json({ message: error.message });
            }
        })
    }
});

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.DSN || '')
    .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)))
    .catch((error) => console.error(error.message));