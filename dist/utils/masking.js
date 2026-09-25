"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskEmail = maskEmail;
exports.maskMobile = maskMobile;
exports.slugify = slugify;
exports.generateUsername = generateUsername;
exports.hashOtp = hashOtp;
const node_crypto_1 = __importDefault(require("node:crypto"));
function maskEmail(email) {
    const [user, domain] = email.split('@');
    if (!domain)
        return email;
    return `${user.slice(0, 2)}***@${domain}`;
}
function maskMobile(mobile) {
    if (mobile.length <= 4)
        return mobile;
    return `${mobile.slice(0, 2)}******${mobile.slice(-2)}`;
}
function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 20);
}
function generateUsername(displayName, email) {
    const base = slugify(displayName || email.split('@')[0] || 'user');
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `${base || 'user'}${suffix}`;
}
function hashOtp(otp) {
    return node_crypto_1.default.createHash('sha256').update(otp).digest('hex');
}
