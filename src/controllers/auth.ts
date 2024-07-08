import passport from 'passport';
import {Request, Response, NextFunction} from 'express';
import User from '../models/Users'
//concurrency issues, figure out how to get info through req

const CLIENT_URL = 'https://devhunt-client-564fb3b4c40a.herokuapp.com/'
const CLIENT_URL_newUser = 'https://devhunt-client-564fb3b4c40a.herokuapp.com/new-user'

declare global {
  namespace Express {
    interface User {
      _id: string
    }
  }
}

export const signInSuccess = async (req: Request, res: Response) => {
    console.log("here")
    if (req.user) {
        try {
            const userDocument = await User.findById(req.user._id);
            if (!userDocument) {
                console.log("user not found")
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }
            const user = userDocument.toObject();
            res.status(200).json({
                success: true,
                message: 'Successful',
                user: user,
                cookies: req.cookies,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while fetching user data',
            });
        }
    } else {
        res.status(400).json({
            success: false,
            message: 'No user information available',
        });
    }
};

export const signInFail = (req: Request, res: Response) => {
    res.status(401).json({
        success: false,
        message: 'failed to authenticate user'
    })
}

export const signOut = (req: Request, res: Response, next: NextFunction)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
    res.redirect(CLIENT_URL);
}

export const googleAuth = passport.authenticate("google", { 
    scope: ['profile', 'email'],
    session: true
})

export const googleAuthCB = (req: any, res: any, next: any) => {
    console.log("made it here")
    const redirectUrl = req.session.isNewUser ? CLIENT_URL_newUser : CLIENT_URL;
    return res.redirect(redirectUrl);
};


export const githubAuth = passport.authenticate('github', {
    scope: ['profile', 'user:email']
})

export const githubAuthCB = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('github', (err: any, user: any, info: any) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/signin/failed');
        }
        req.logIn(user, (err: any) => {
            if (err) {
                return next(err);
            }
            const redirectUrl = req.session.isNewUser ? CLIENT_URL_newUser : CLIENT_URL;
            return res.redirect(redirectUrl);
        });
    })(req, res, next);
};