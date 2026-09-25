import express from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { complaints } from '../storage/store';
import { randomUUID } from 'node:crypto';

const router = express.Router();

router.use(authenticate);

router.post('/', (req: Request, res: Response) => {
  const user = (req as Request & { user?: { id: string } }).user;
  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { accused_id, call_id, reason, evidence_url } = req.body || {};
  if (!accused_id || !reason) {
    res.status(400).json({ message: 'accused_id and reason are required' });
    return;
  }

  complaints.push({
    id: randomUUID(),
    complainantId: user.id,
    accusedId: accused_id,
    callId: call_id,
    reason,
    evidenceUrl: evidence_url,
    status: 'open',
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ message: 'Complaint submitted' });
});

export default router;
