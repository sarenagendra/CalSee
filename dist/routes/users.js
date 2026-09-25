"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const store_1 = require("../storage/store");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.get('/online', (req, res) => {
    const language = String(req.query.language ?? '');
    const currentUser = req.user;
    if (!currentUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const result = store_1.profiles
        .filter((profile) => profile.isOnline)
        .filter((profile) => profile.userId !== currentUser.id)
        .filter((profile) => {
        if (!language)
            return true;
        return profile.language === language;
    })
        .map((profile) => {
        const user = store_1.users.find((entry) => entry.id === profile.userId);
        return {
            userId: profile.userId,
            displayName: profile.displayName,
            city: profile.city || 'Unknown',
            language: profile.language,
            hobbies: profile.hobbies,
            avatarUrl: profile.avatarUrl,
            username: user?.username || 'unknown'
        };
    });
    res.status(200).json({ users: result });
});
exports.default = router;
