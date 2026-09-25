"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const store_1 = require("../storage/store");
const node_crypto_1 = require("node:crypto");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.post('/', (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { accused_id, call_id, reason, evidence_url } = req.body || {};
    if (!accused_id || !reason) {
        res.status(400).json({ message: 'accused_id and reason are required' });
        return;
    }
    store_1.complaints.push({
        id: (0, node_crypto_1.randomUUID)(),
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
exports.default = router;
