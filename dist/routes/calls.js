"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const billing_1 = require("../services/billing");
const store_1 = require("../storage/store");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.post('/initiate', (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { to } = req.body || {};
    if (!to) {
        res.status(400).json({ message: 'target user is required' });
        return;
    }
    const target = store_1.users.find((entry) => entry.id === to);
    if (!target) {
        res.status(404).json({ message: 'Target user not found' });
        return;
    }
    const wallet = (0, store_1.getWalletByUserId)(user.id);
    if (!wallet || wallet.balancePaisa < 1000) {
        res.status(402).json({ message: 'Insufficient wallet balance to begin a call' });
        return;
    }
    const call = (0, store_1.createCall)({
        callerId: user.id,
        receiverId: target.id,
        status: 'ringing',
        billedSeconds: 0,
        amountChargedPaisa: 0,
        amountEarnedPaisa: 0
    });
    res.status(200).json({ message: 'Call ringing', call });
});
router.post('/accept', (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { call_id } = req.body || {};
    const call = store_1.calls.find((entry) => entry.id === call_id && entry.receiverId === user.id);
    if (!call) {
        res.status(404).json({ message: 'Call not found' });
        return;
    }
    call.status = 'ongoing';
    call.startedAt = new Date().toISOString();
    res.status(200).json({ message: 'Call accepted', call });
});
router.post('/end', (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { call_id } = req.body || {};
    const call = store_1.calls.find((entry) => entry.id === call_id && (entry.callerId === user.id || entry.receiverId === user.id));
    if (!call) {
        res.status(404).json({ message: 'Call not found' });
        return;
    }
    call.status = 'ended';
    call.endedAt = new Date().toISOString();
    call.endReason = 'user_ended';
    res.status(200).json({ message: 'Call ended', call });
});
setInterval(() => {
    for (const call of store_1.calls) {
        if (call.status !== 'ongoing')
            continue;
        const callerWallet = (0, store_1.getWalletByUserId)(call.callerId);
        const receiverEarnings = (0, store_1.getEarningsWalletByUserId)(call.receiverId);
        if (!callerWallet || !receiverEarnings)
            continue;
        const cost = (0, billing_1.calculateCostForSeconds)(5, 71); // 7.1 paise/sec => 35.5 per 5s
        if (callerWallet.balancePaisa < cost) {
            call.status = 'ended';
            call.endReason = 'balance_exhausted';
            continue;
        }
        callerWallet.balancePaisa -= cost;
        call.amountChargedPaisa += cost;
        call.billedSeconds += 5;
        const earning = Math.round((0, billing_1.getPayoutShare)(cost, 5));
        receiverEarnings.balancePaisa += earning;
        call.amountEarnedPaisa += earning;
    }
}, 5000);
exports.default = router;
