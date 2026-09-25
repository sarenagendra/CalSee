import express from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { getProfileByUserId, profiles } from '../storage/store';

const router = express.Router();
const bankAccounts = new Map<string, Record<string, string | boolean>>();

router.use(authenticate);

router.post('/complete', (req: Request, res: Response) => {
  const { name, displayName, city, language, hobbies } = req.body || {};
  const user = (req as Request & { user?: { id: string } }).user;
  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (!name || !displayName || !language) {
    res.status(400).json({ message: 'name, displayName and language are required' });
    return;
  }

  const profile = getProfileByUserId(user.id) ?? {
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

  const index = profiles.findIndex((entry) => entry.userId === user.id);
  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }

  res.status(200).json({ profile });
});

router.post('/bank-account', (req: Request, res: Response) => {
  const user = (req as Request & { user?: { id: string, gender?: string } }).user;
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

export default router;
