"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const store_1 = require("../storage/store");
const masking_1 = require("../utils/masking");
const router = express_1.default.Router();
const mobileMap = new Map();
router.use(auth_1.authenticate);
router.get('/users', (req, res) => {
    const query = String(req.query.query ?? '').toLowerCase();
    const filtered = store_1.users.filter((user) => {
        if (!query)
            return true;
        return user.username.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
    });
    res.status(200).json({
        users: filtered.map((user) => ({
            username: user.username,
            masked_email: (0, masking_1.maskEmail)(user.email),
            masked_mobile: (0, masking_1.maskMobile)(mobileMap.get(user.id) || '919876543210'),
            gender: user.gender,
            status: user.status,
            created_at: user.createdAt,
            complaint_count: store_1.complaints.filter((entry) => entry.accusedId === user.id || entry.complainantId === user.id).length
        }))
    });
});
router.get('/users/:id/reveal', (req, res) => {
    const user = store_1.users.find((entry) => entry.id === req.params.id);
    const currentUser = req.user;
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
    (0, store_1.recordAudit)(currentUser.id, 'reveal_user_contact', user.id, { email: user.email });
    res.status(200).json({ user: payload });
});
router.get('/complaints', (req, res) => {
    const status = String(req.query.status ?? 'open');
    const filtered = status === 'all' ? store_1.complaints : store_1.complaints.filter((entry) => entry.status === status);
    res.status(200).json({ complaints: filtered });
});
router.post('/complaints/:id/block', (req, res) => {
    const currentUser = req.user;
    if (!currentUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const complaint = store_1.complaints.find((entry) => entry.id === req.params.id);
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
    store_1.blocks.push(entry);
    complaint.status = 'resolved';
    complaint.reviewedBy = currentUser.id;
    complaint.resolvedAt = new Date().toISOString();
    (0, store_1.recordAudit)(currentUser.id, 'block_user', complaint.accusedId, { complaintId: complaint.id });
    res.status(200).json({ message: 'User blocked for the complaint pair', block: entry });
});
exports.default = router;
