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
exports.githubAuthCB = exports.githubAuth = exports.googleAuthCB = exports.googleAuth = exports.signOut = exports.signInFail = exports.signInSuccess = void 0;
const passport_1 = __importDefault(require("passport"));
const Users_1 = __importDefault(require("../models/Users"));
//concurrency issues, figure out how to get info through req
const CLIENT_URL = 'https://devhunt.app';
const CLIENT_URL_newUser = 'https://devhunt.app/new-user';
const signInSuccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        try {
            const userDocument = yield Users_1.default.findById(req.user._id);
            if (!userDocument) {
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while fetching user data',
            });
        }
    }
    else {
        res.status(400).json({
            success: false,
            message: 'No user information available',
        });
    }
});
exports.signInSuccess = signInSuccess;
const signInFail = (req, res) => {
    res.status(401).json({
        success: false,
        message: 'failed to authenticate user'
    });
};
exports.signInFail = signInFail;
const signOut = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
    res.redirect(CLIENT_URL);
};
exports.signOut = signOut;
exports.googleAuth = passport_1.default.authenticate("google", {
    scope: ['profile', 'email'],
    session: true
});
const googleAuthCB = (req, res, next) => {
    console.log("made it here");
    const redirectUrl = req.session.isNewUser ? CLIENT_URL_newUser : CLIENT_URL;
    return res.redirect(redirectUrl);
};
exports.googleAuthCB = googleAuthCB;
exports.githubAuth = passport_1.default.authenticate('github', {
    scope: ['profile', 'user:email']
});
const githubAuthCB = (req, res, next) => {
    passport_1.default.authenticate('github', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/signin/failed');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            const redirectUrl = req.session.isNewUser ? CLIENT_URL_newUser : CLIENT_URL;
            return res.redirect(redirectUrl);
        });
    })(req, res, next);
};
exports.githubAuthCB = githubAuthCB;
