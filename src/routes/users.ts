import express from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { profiles, users } from '../storage/store';
import { maskEmail, maskMobile } from '../utils/masking';

const router = express.Router();

router.use(authenticate);

router.get('/online', (req: Request, res: Response) => {
  const language = String(req.query.language ?? '');
  const currentUser = (req as Request & { user?: { id: string, gender?: string } }).user;
  if (!currentUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const result = profiles
    .filter((profile) => profile.isOnline)
    .filter((profile) => profile.userId !== currentUser.id)
    .filter((profile) => {
      if (!language) return true;
      return profile.language === language;
    })
    .map((profile) => {
      const user = users.find((entry) => entry.id === profile.userId);
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

export default router;
