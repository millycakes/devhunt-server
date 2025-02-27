"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const posts_1 = require("../controllers/posts");
const router = express_1.default.Router();
router.get('/', posts_1.getPosts);
router.get('/:post', posts_1.getPostById);
router.post('/upload', posts_1.uploadPost);
router.put('/likeOrUnlike', posts_1.likeOrUnlike);
router.get('/by/:user', posts_1.getUserPosts);
router.get('/liked/:user', posts_1.getLikedPosts);
router.get('/liked/ids/:user', posts_1.getLikedPostIds);
router.get('/search/:search', posts_1.searchPosts);
router.delete('/:post', posts_1.deletePost);
router.post('/editWithPicture');
router.put('/edit', posts_1.editPost);
router.put('/comment', posts_1.postComment);
router.get('/comments/:post', posts_1.getComments);
exports.default = router;
