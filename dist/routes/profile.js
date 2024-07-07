"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profile_1 = require("../controllers/profile");
const router = express_1.default.Router();
router.get('/:user', profile_1.getUser);
router.post('/edit', profile_1.editProfile);
router.delete('/delete/:user', profile_1.deleteProfile);
router.get('/getNotis/:user', profile_1.getNotis);
router.put('/readNoti', profile_1.readNoti);
exports.default = router;
