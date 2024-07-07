"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
router.get('/signin/success', auth_1.signInSuccess);
router.get('/signin/failed', auth_1.signInFail);
router.get('/signout', auth_1.signOut);
router.get("/google", auth_1.googleAuth);
router.get('/google/callback', passport_1.default.authenticate('google', { failureRedirect: '/signin/failed', session: true }), (req, res, next) => {
    (0, auth_1.googleAuthCB)(req, res, next);
});
router.get('/github', auth_1.githubAuth);
router.get('/github/callback', auth_1.githubAuthCB);
exports.default = router;
