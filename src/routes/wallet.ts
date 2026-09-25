import express from 'express';
import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { config } from '../config';
import { addWalletTransaction, createCall, getUserById, getWalletByUserId, rechargePlans, users, walletTransactions, wallets } from '../storage/store';

const router = express.Router();

router.use(authenticate);

router.get('/', (req: Request, res: Response) => {
  const user = (req as Request & { user?: { id: string } }).user;
  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const wallet = getWalletByUserId(user.id);
  res.status(200).json({ balancePaisa: wallet?.balancePaisa ?? 0 });
});

router.get('/plans', (_req, res) => {
  res.status(200).json({ plans: rechargePlans });
});

router.post('/recharge/order', (req: Request, res: Response) => {
  const user = (req as Request & { user?: { id: string } }).user;
  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { plan_id } = req.body || {};
  const plan = rechargePlans.find((entry) => entry.id === Number(plan_id));
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

router.post('/recharge/verify', (req: Request, res: Response) => {
  const user = (req as Request & { user?: { id: string } }).user;
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
  const expected = crypto.createHmac('sha256', config.razorpaySecret).update(payload).digest('hex');

  if (expected !== razorpay_signature) {
    res.status(400).json({ message: 'Razorpay signature verification failed' });
    return;
  }

  const plan = rechargePlans.find((entry) => entry.id === Number(plan_id));
  const wallet = getWalletByUserId(user.id);
  if (!wallet) {
    res.status(404).json({ message: 'Wallet not found' });
    return;
  }

  const amount = plan ? plan.pricePaisa : 9800;
  wallet.balancePaisa += amount;
  wallet.updatedAt = new Date().toISOString();

  addWalletTransaction({
    userId: user.id,
    type: 'recharge',
    amountPaisa: amount,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    createdAt: new Date().toISOString()
  });

  res.status(200).json({ message: 'Recharge verified and wallet credited', balancePaisa: wallet.balancePaisa });
});

router.post('/webhooks/razorpay', (req: Request, res: Response) => {
  const { event, payment_id, order_id, amount_paise } = req.body || {};
  if (event !== 'payment.captured') {
    res.status(200).json({ message: 'Ignored event' });
    return;
  }

  const tx = walletTransactions.find((entry) => entry.razorpayPaymentId === payment_id);
  if (tx) {
    res.status(200).json({ message: 'Webhook already processed' });
    return;
  }

  const user = users.find((entry) => entry.id === order_id?.split('_')[2]);
  if (!user) {
    res.status(404).json({ message: 'User matching payment not found' });
    return;
  }

  const wallet = getWalletByUserId(user.id);
  if (wallet) {
    wallet.balancePaisa += Number(amount_paise || 9800);
  }

  addWalletTransaction({
    userId: user.id,
    type: 'recharge',
    amountPaisa: Number(amount_paise || 9800),
    razorpayOrderId: order_id,
    razorpayPaymentId: payment_id,
    createdAt: new Date().toISOString()
  });

  res.status(200).json({ message: 'Webhook processed' });
});

export default router;
