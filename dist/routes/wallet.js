"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const auth_1 = require("../middleware/auth");
const config_1 = require("../config");
const store_1 = require("../storage/store");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.get('/', (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const wallet = (0, store_1.getWalletByUserId)(user.id);
    res.status(200).json({ balancePaisa: wallet?.balancePaisa ?? 0 });
});
router.get('/plans', (_req, res) => {
    res.status(200).json({ plans: store_1.rechargePlans });
});
router.post('/recharge/order', (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { plan_id } = req.body || {};
    const plan = store_1.rechargePlans.find((entry) => entry.id === Number(plan_id));
    if (!plan) {
        res.status(404).json({ message: 'Plan not found' });
        return;
    }
    res.status(201).json({
        order_id: `order_${plan.id}_${user.id}`,
        amount_paise: plan.pricePaisa,
        currency: 'INR'
    });
});
router.post('/recharge/verify', (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_id } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400).json({ message: 'Missing Razorpay verification fields' });
        return;
    }
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = node_crypto_1.default.createHmac('sha256', config_1.config.razorpaySecret).update(payload).digest('hex');
    if (expected !== razorpay_signature) {
        res.status(400).json({ message: 'Razorpay signature verification failed' });
        return;
    }
    const plan = store_1.rechargePlans.find((entry) => entry.id === Number(plan_id));
    const wallet = (0, store_1.getWalletByUserId)(user.id);
    if (!wallet) {
        res.status(404).json({ message: 'Wallet not found' });
        return;
    }
    const amount = plan ? plan.pricePaisa : 9800;
    wallet.balancePaisa += amount;
    wallet.updatedAt = new Date().toISOString();
    (0, store_1.addWalletTransaction)({
        userId: user.id,
        type: 'recharge',
        amountPaisa: amount,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        createdAt: new Date().toISOString()
    });
    res.status(200).json({ message: 'Recharge verified and wallet credited', balancePaisa: wallet.balancePaisa });
});
router.post('/webhooks/razorpay', (req, res) => {
    const { event, payment_id, order_id, amount_paise } = req.body || {};
    if (event !== 'payment.captured') {
        res.status(200).json({ message: 'Ignored event' });
        return;
    }
    const tx = store_1.walletTransactions.find((entry) => entry.razorpayPaymentId === payment_id);
    if (tx) {
        res.status(200).json({ message: 'Webhook already processed' });
        return;
    }
    const user = store_1.users.find((entry) => entry.id === order_id?.split('_')[2]);
    if (!user) {
        res.status(404).json({ message: 'User matching payment not found' });
        return;
    }
    const wallet = (0, store_1.getWalletByUserId)(user.id);
    if (wallet) {
        wallet.balancePaisa += Number(amount_paise || 9800);
    }
    (0, store_1.addWalletTransaction)({
        userId: user.id,
        type: 'recharge',
        amountPaisa: Number(amount_paise || 9800),
        razorpayOrderId: order_id,
        razorpayPaymentId: payment_id,
        createdAt: new Date().toISOString()
    });
    res.status(200).json({ message: 'Webhook processed' });
});
exports.default = router;
