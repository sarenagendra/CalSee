import express from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { getEarningsWalletByUserId } from '../storage/store';

const router = express.Router();
router.use(authenticate);

router.get('/', (req: Request, res: Response) => {
  const user = (req as Request & { user?: { id: string, gender?: string } }).user;
  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (user.gender !== 'female') {
    res.status(403).json({ message: 'Only women can access earnings' });
    return;
  }

  const wallet = getEarningsWalletByUserId(user.id);
  res.status(200).json({ balancePaisa: wallet?.balancePaisa ?? 0 });
});

export default router;
