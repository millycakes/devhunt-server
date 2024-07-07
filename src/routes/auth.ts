import express, { Router } from 'express';
import { signInFail, githubAuth, githubAuthCB, googleAuth, googleAuthCB, signInSuccess, signOut } from '../controllers/auth';
import passport from 'passport';

const router: Router = express.Router();

router.get('/signin/success', signInSuccess)
router.get('/signin/failed', signInFail)
router.get('/signout', signOut)
router.get("/google", googleAuth);
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/signin/failed', session: true }),
    (req: any, res: any, next: any) => {
        googleAuthCB(req, res, next);
    }
);router.get('/github', githubAuth);
router.get('/github/callback', githubAuthCB)

export default router;