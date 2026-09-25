import express from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { calculateCostForSeconds, getPayoutShare } from '../services/billing';
import { calls, createCall, getEarningsWalletByUserId, getWalletByUserId, profiles, users } from '../storage/store';

const router = express.Router();

router.use(authenticate);

router.post('/initiate', (req: Request, res: Response) => {
  const user = (req as Request & { user?: { id: string } }).user;
  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { to } = req.body || {};
  if (!to) {
    res.status(400).json({ message: 'target user is required' });
    return;
  }

  const target = users.find((entry) => entry.id === to);
  if (!target) {
    res.status(404).json({ message: 'Target user not found' });
    return;
  }

  const wallet = getWalletByUserId(user.id);
  if (!wallet || wallet.balancePaisa < 1000) {
    res.status(402).json({ message: 'Insufficient wallet balance to begin a call' });
    return;
  }

  const call = createCall({
    callerId: user.id,
    receiverId: target.id,
    status: 'ringing',
    billedSeconds: 0,
    amountChargedPaisa: 0,
    amountEarnedPaisa: 0
  });

  res.status(200).json({ message: 'Call ringing', call });
});

router.post('/accept', (req: Request, res: Response) => {
  const user = (req as Request & { user?: { id: string } }).user;
  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { call_id } = req.body || {};
  const call = calls.find((entry) => entry.id === call_id && entry.receiverId === user.id);
  if (!call) {
    res.status(404).json({ message: 'Call not found' });
    return;
  }

  call.status = 'ongoing';
  call.startedAt = new Date().toISOString();
  res.status(200).json({ message: 'Call accepted', call });
});

router.post('/end', (req: Request, res: Response) => {
  const user = (req as Request & { user?: { id: string } }).user;
  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { call_id } = req.body || {};
  const call = calls.find((entry) => entry.id === call_id && (entry.callerId === user.id || entry.receiverId === user.id));
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
  for (const call of calls) {
    if (call.status !== 'ongoing') continue;

    const callerWallet = getWalletByUserId(call.callerId);
    const receiverEarnings = getEarningsWalletByUserId(call.receiverId);
    if (!callerWallet || !receiverEarnings) continue;

    const cost = calculateCostForSeconds(5, 71); // 7.1 paise/sec => 35.5 per 5s
    if (callerWallet.balancePaisa < cost) {
      call.status = 'ended';
      call.endReason = 'balance_exhausted';
      continue;
    }

    callerWallet.balancePaisa -= cost;
    call.amountChargedPaisa += cost;
    call.billedSeconds += 5;

    const earning = Math.round(getPayoutShare(cost, 5));
    receiverEarnings.balancePaisa += earning;
    call.amountEarnedPaisa += earning;
  }
}, 5000);

export default router;
