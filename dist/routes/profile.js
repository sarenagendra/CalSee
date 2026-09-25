"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const store_1 = require("../storage/store");
const router = express_1.default.Router();
const bankAccounts = new Map();
router.use(auth_1.authenticate);
router.post('/complete', (req, res) => {
    const { name, displayName, city, language, hobbies } = req.body || {};
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    if (!name || !displayName || !language) {
        res.status(400).json({ message: 'name, displayName and language are required' });
        return;
    }
    const profile = (0, store_1.getProfileByUserId)(user.id) ?? {
        userId: user.id,
        name: '',
        displayName: '',
        city: '',
        language: 'english',
        hobbies: [],
        isOnline: false
    };
    profile.name = name;
    profile.displayName = displayName;
    profile.city = city || '';
    profile.language = language;
    profile.hobbies = Array.isArray(hobbies) ? hobbies : [];
    profile.isOnline = true;
    const index = store_1.profiles.findIndex((entry) => entry.userId === user.id);
    if (index >= 0) {
        store_1.profiles[index] = profile;
    }
    else {
        store_1.profiles.push(profile);
    }
    res.status(200).json({ profile });
});
router.post('/bank-account', (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    if (user.gender !== 'female') {
        res.status(403).json({ message: 'Bank details are only available for women' });
        return;
    }
    const { account_number, ifsc, account_holder_name, branch_name } = req.body || {};
    if (!account_number || !ifsc || !account_holder_name || !branch_name) {
        res.status(400).json({ message: 'account_number, ifsc, account_holder_name and branch_name are required' });
        return;
    }
    bankAccounts.set(user.id, {
        account_number,
        ifsc,
        account_holder_name,
        branch_name,
        verified: false
    });
    res.status(201).json({ message: 'Bank account stored and pending verification' });
});
exports.default = router;
