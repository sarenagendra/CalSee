"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuditLog = exports.blocks = exports.complaints = exports.calls = exports.walletTransactions = exports.rechargePlans = exports.otpVerifications = exports.earningsWallets = exports.wallets = exports.profiles = exports.users = void 0;
exports.getUserByEmail = getUserByEmail;
exports.getUserById = getUserById;
exports.getProfileByUserId = getProfileByUserId;
exports.getWalletByUserId = getWalletByUserId;
exports.getEarningsWalletByUserId = getEarningsWalletByUserId;
exports.createWalletForUser = createWalletForUser;
exports.createEarningsWalletForUser = createEarningsWalletForUser;
exports.createCall = createCall;
exports.recordAudit = recordAudit;
exports.addWalletTransaction = addWalletTransaction;
const node_crypto_1 = require("node:crypto");
exports.users = [];
exports.profiles = [];
exports.wallets = [];
exports.earningsWallets = [];
exports.otpVerifications = [];
exports.rechargePlans = [
    { id: 1, label: 'Starter', pricePaisa: 4900, minutes: 11, bonusPct: 0, isActive: true },
    { id: 2, label: 'Basic', pricePaisa: 9800, minutes: 23, bonusPct: 0, isActive: true },
    { id: 3, label: 'Popular', pricePaisa: 19900, minutes: 50, bonusPct: 0, isActive: true },
    { id: 4, label: 'Value', pricePaisa: 49900, minutes: 135, bonusPct: 5, isActive: true },
    { id: 5, label: 'Premium', pricePaisa: 99900, minutes: 290, bonusPct: 8, isActive: true },
    { id: 6, label: 'Elite', pricePaisa: 199900, minutes: 620, bonusPct: 12, isActive: true }
];
exports.walletTransactions = [];
exports.calls = [];
exports.complaints = [];
exports.blocks = [];
exports.adminAuditLog = [];
function getUserByEmail(email) {
    return exports.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}
function getUserById(userId) {
    return exports.users.find((user) => user.id === userId);
}
function getProfileByUserId(userId) {
    return exports.profiles.find((profile) => profile.userId === userId);
}
function getWalletByUserId(userId) {
    return exports.wallets.find((wallet) => wallet.userId === userId);
}
function getEarningsWalletByUserId(userId) {
    return exports.earningsWallets.find((wallet) => wallet.userId === userId);
}
function createWalletForUser(userId) {
    const wallet = {
        userId,
        balancePaisa: 0,
        updatedAt: new Date().toISOString()
    };
    exports.wallets.push(wallet);
    return wallet;
}
function createEarningsWalletForUser(userId) {
    const wallet = {
        userId,
        balancePaisa: 0,
        updatedAt: new Date().toISOString()
    };
    exports.earningsWallets.push(wallet);
    return wallet;
}
function createCall(call) {
    const record = { id: (0, node_crypto_1.randomUUID)(), ...call };
    exports.calls.push(record);
    return record;
}
function recordAudit(adminId, action, targetId, metadata) {
    const entry = {
        id: (0, node_crypto_1.randomUUID)(),
        adminId,
        action,
        targetId,
        metadata,
        createdAt: new Date().toISOString()
    };
    exports.adminAuditLog.push(entry);
    return entry;
}
function addWalletTransaction(entry) {
    const trans = { id: (0, node_crypto_1.randomUUID)(), ...entry };
    exports.walletTransactions.push(trans);
    return trans;
}
