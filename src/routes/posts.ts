import express, { Router } from 'express';
import { getPosts, getPostById, uploadPost, likeOrUnlike, getUserPosts, getLikedPosts, getLikedPostIds,deletePost,editPost,searchPosts,postComment,getComments } from '../controllers/posts';

const router: Router = express.Router();

router.get('/', getPosts);
router.get('/:post', getPostById)
router.post('/upload', uploadPost);
router.put('/likeOrUnlike', likeOrUnlike);
router.get('/by/:user', getUserPosts);
router.get('/liked/:user', getLikedPosts);
router.get('/liked/ids/:user', getLikedPostIds);
router.get('/search/:search', searchPosts);
router.delete('/:post',deletePost);
router.post('/editWithPicture');
router.put('/edit',editPost)
router.put('/comment', postComment)
router.get('/comments/:post', getComments)


export default router;