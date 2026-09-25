import express from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { adminAuditLog, blocks, complaints, recordAudit, users } from '../storage/store';
import { maskEmail, maskMobile } from '../utils/masking';

const router = express.Router();
const mobileMap = new Map<string, string>();

router.use(authenticate);

router.get('/users', (req: Request, res: Response) => {
  const query = String(req.query.query ?? '').toLowerCase();
  const filtered = users.filter((user) => {
    if (!query) return true;
    return user.username.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
  });

  res.status(200).json({
    users: filtered.map((user) => ({
      username: user.username,
      masked_email: maskEmail(user.email),
      masked_mobile: maskMobile(mobileMap.get(user.id) || '919876543210'),
      gender: user.gender,
      status: user.status,
      created_at: user.createdAt,
      complaint_count: complaints.filter((entry) => entry.accusedId === user.id || entry.complainantId === user.id).length
    }))
  });
});

router.get('/users/:id/reveal', (req: Request, res: Response) => {
  const user = users.find((entry) => entry.id === req.params.id);
  const currentUser = (req as Request & { user?: { id: string, role?: string } }).user;
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (currentUser?.role !== 'admin') {
    res.status(403).json({ message: 'Only senior admin can reveal full contact data' });
    return;
  }

  const payload = {
    id: user.id,
    email: user.email,
    mobile: mobileMap.get(user.id) || '919876543210',
    username: user.username,
    created_at: user.createdAt
  };

  recordAudit(currentUser.id, 'reveal_user_contact', user.id, { email: user.email });
  res.status(200).json({ user: payload });
});

router.get('/complaints', (req: Request, res: Response) => {
  const status = String(req.query.status ?? 'open');
  const filtered = status === 'all' ? complaints : complaints.filter((entry) => entry.status === status);
  res.status(200).json({ complaints: filtered });
});

router.post('/complaints/:id/block', (req: Request, res: Response) => {
  const currentUser = (req as Request & { user?: { id: string } }).user;
  if (!currentUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const complaint = complaints.find((entry) => entry.id === req.params.id);
  if (!complaint) {
    res.status(404).json({ message: 'Complaint not found' });
    return;
  }

  const entry = {
    id: `block_${Date.now()}`,
    blockedUserId: complaint.accusedId,
    protectedUserId: complaint.complainantId,
    complaintId: complaint.id,
    createdAt: new Date().toISOString()
  };
  blocks.push(entry);
  complaint.status = 'resolved';
  complaint.reviewedBy = currentUser.id;
  complaint.resolvedAt = new Date().toISOString();

  recordAudit(currentUser.id, 'block_user', complaint.accusedId, { complaintId: complaint.id });
  res.status(200).json({ message: 'User blocked for the complaint pair', block: entry });
});

export default router;
