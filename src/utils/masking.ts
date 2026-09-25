import crypto from 'node:crypto';

export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return `${user.slice(0, 2)}***@${domain}`;
}

export function maskMobile(mobile: string): string {
  if (mobile.length <= 4) return mobile;
  return `${mobile.slice(0, 2)}******${mobile.slice(-2)}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 20);
}

export function generateUsername(displayName: string, email: string): string {
  const base = slugify(displayName || email.split('@')[0] || 'user');
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base || 'user'}${suffix}`;
}

export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}
