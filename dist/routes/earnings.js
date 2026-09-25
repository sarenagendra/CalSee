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
router.get('/', (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    if (user.gender !== 'female') {
        res.status(403).json({ message: 'Only women can access earnings' });
        return;
    }
    const wallet = (0, store_1.getEarningsWalletByUserId)(user.id);
    res.status(200).json({ balancePaisa: wallet?.balancePaisa ?? 0 });
});
exports.default = router;
