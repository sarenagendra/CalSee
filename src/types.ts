export type Gender = 'male' | 'female';
export type UserRole = 'user' | 'admin' | 'support';
export type UserStatus = 'active' | 'suspended' | 'banned';
export type ComplaintStatus = 'open' | 'reviewing' | 'resolved' | 'rejected';
export type CallStatus = 'ringing' | 'ongoing' | 'ended' | 'missed' | 'rejected';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  gender: Gender;
  role: UserRole;
  status: UserStatus;
  username: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  userId: string;
  name: string;
  displayName: string;
  city?: string;
  language: string;
  hobbies: string[];
  avatarUrl?: string;
  isOnline: boolean;
  lastSeenAt?: string;
}

export interface Wallet {
  userId: string;
  balancePaisa: number;
  updatedAt: string;
}

export interface EarningsWallet {
  userId: string;
  balancePaisa: number;
  updatedAt: string;
}

export interface OtpVerification {
  id: string;
  email: string;
  otpHash: string;
  purpose: 'register' | 'login' | 'reset_password';
  expiresAt: string;
  attempts: number;
  consumed: boolean;
  createdAt: string;
}

export interface RechargePlan {
  id: number;
  label: string;
  pricePaisa: number;
  minutes: number;
  bonusPct: number;
  isActive: boolean;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'recharge' | 'call_debit' | 'refund';
  amountPaisa: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  callId?: string;
  createdAt: string;
}

export interface CallRecord {
  id: string;
  callerId: string;
  receiverId: string;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
  billedSeconds: number;
  amountChargedPaisa: number;
  amountEarnedPaisa: number;
  endReason?: string;
}

export interface Complaint {
  id: string;
  complainantId: string;
  accusedId: string;
  callId?: string;
  reason: string;
  evidenceUrl?: string;
  status: ComplaintStatus;
  reviewedBy?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface BlockRecord {
  id: string;
  blockedUserId: string;
  protectedUserId: string;
  complaintId?: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AppRequest extends Express.Request {
  user?: User;
}
