"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const Users_1 = __importDefault(require("../models/Users"));
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
passport_1.default.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
}, function (req, accessToken, refreshToken, profile, done) {
    const name = profile.displayName;
    const email = profile.emails[0].value;
    const avatar = profile.photos[0].value;
    const googleId = profile.id;
    const googleProfile = new Users_1.default({
        name,
        email,
        avatar,
        googleId
    });
    Users_1.default.findOne({
        googleId: googleId
    }).then((resolvedResult) => {
        if (resolvedResult) {
            req.session.isNewUser = false;
            console.log('User profile already exists');
            done(null, resolvedResult);
        }
        else {
            googleProfile.save().then((resolvedResult) => {
                req.session.isNewUser = true;
                console.log('Successfuly saved to DB');
                done(null, resolvedResult);
            }, (err) => {
                console.log('Error occured in saving to DB');
                done(null, resolvedResult);
            });
        }
    }, (err) => {
        console.log('Error in saving user profile to DB');
    });
}));
passport_1.default.use(new GithubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: '/auth/github/callback',
    scope: ['user:email']
}, function (req, accessToken, refreshToken, profile, done) {
    const name = profile.displayName;
    const email = profile.emails[0].value;
    const avatar = profile.photos[0].value;
    const githubId = profile.id;
    const githubProfile = new Users_1.default({
        name,
        email,
        avatar,
        githubId
    });
    Users_1.default.findOne({
        githubId: githubId
    }).then((resolvedResult) => {
        if (resolvedResult) {
            req.session.isNewUser = false;
            console.log('User profile already exists');
            done(null, resolvedResult);
        }
        else {
            githubProfile.save().then((resolvedResult) => {
                req.session.isNewUser = true;
                console.log('Successfuly saved to DB');
                done(null, resolvedResult);
            }, (err) => {
                console.log('Error occured in saving to DB' + err);
                done(null, resolvedResult);
            });
        }
    }, (err) => {
        console.log('Error in saving user profile to DB');
    });
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => {
    done(null, user);
});
