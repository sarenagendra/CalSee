import { randomUUID } from 'node:crypto';
import type {
  AdminAuditLog,
  BlockRecord,
  CallRecord,
  Complaint,
  EarningsWallet,
  OtpVerification,
  Profile,
  RechargePlan,
  User,
  Wallet,
  WalletTransaction,
} from '../types';

export const users: User[] = [];
export const profiles: Profile[] = [];
export const wallets: Wallet[] = [];
export const earningsWallets: EarningsWallet[] = [];
export const otpVerifications: OtpVerification[] = [];
export const rechargePlans: RechargePlan[] = [
  { id: 1, label: 'Starter', pricePaisa: 4900, minutes: 11, bonusPct: 0, isActive: true },
  { id: 2, label: 'Basic', pricePaisa: 9800, minutes: 23, bonusPct: 0, isActive: true },
  { id: 3, label: 'Popular', pricePaisa: 19900, minutes: 50, bonusPct: 0, isActive: true },
  { id: 4, label: 'Value', pricePaisa: 49900, minutes: 135, bonusPct: 5, isActive: true },
  { id: 5, label: 'Premium', pricePaisa: 99900, minutes: 290, bonusPct: 8, isActive: true },
  { id: 6, label: 'Elite', pricePaisa: 199900, minutes: 620, bonusPct: 12, isActive: true }
];
export const walletTransactions: WalletTransaction[] = [];
export const calls: CallRecord[] = [];
export const complaints: Complaint[] = [];
export const blocks: BlockRecord[] = [];
export const adminAuditLog: AdminAuditLog[] = [];

export function getUserByEmail(email: string): User | undefined {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(userId: string): User | undefined {
  return users.find((user) => user.id === userId);
}

export function getProfileByUserId(userId: string): Profile | undefined {
  return profiles.find((profile) => profile.userId === userId);
}

export function getWalletByUserId(userId: string): Wallet | undefined {
  return wallets.find((wallet) => wallet.userId === userId);
}

export function getEarningsWalletByUserId(userId: string): EarningsWallet | undefined {
  return earningsWallets.find((wallet) => wallet.userId === userId);
}

export function createWalletForUser(userId: string): Wallet {
  const wallet = {
    userId,
    balancePaisa: 0,
    updatedAt: new Date().toISOString()
  };
  wallets.push(wallet);
  return wallet;
}

export function createEarningsWalletForUser(userId: string): EarningsWallet {
  const wallet = {
    userId,
    balancePaisa: 0,
    updatedAt: new Date().toISOString()
  };
  earningsWallets.push(wallet);
  return wallet;
}

export function createCall(call: Omit<CallRecord, 'id'>): CallRecord {
  const record = { id: randomUUID(), ...call };
  calls.push(record);
  return record;
}

export function recordAudit(adminId: string, action: string, targetId?: string, metadata?: Record<string, unknown>): AdminAuditLog {
  const entry: AdminAuditLog = {
    id: randomUUID(),
    adminId,
    action,
    targetId,
    metadata,
    createdAt: new Date().toISOString()
  };
  adminAuditLog.push(entry);
  return entry;
}

export function addWalletTransaction(entry: Omit<WalletTransaction, 'id'>): WalletTransaction {
  const trans = { id: randomUUID(), ...entry };
  walletTransactions.push(trans);
  return trans;
}
