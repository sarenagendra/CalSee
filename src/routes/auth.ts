import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { config } from '../config';
import { hashOtp, generateUsername } from '../utils/masking';
import { getUserByEmail, users, otpVerifications, profiles, createWalletForUser, createEarningsWalletForUser } from '../storage/store';
import type { User } from '../types';

const router = express.Router();

function signTokens(user: User) {
  const accessToken = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, config.refreshSecret, { expiresIn: '30d' });
  return { accessToken, refreshToken };
}

router.post('/register', (req, res) => {
  const { email, password, gender } = req.body || {};
  if (!email || !password || !gender) {
    res.status(400).json({ message: 'email, password and gender are required' });
    return;
  }

  if (getUserByEmail(email)) {
    res.status(409).json({ message: 'User already exists' });
    return;
  }

  const otp = String(100000 + Math.floor(Math.random() * 900000));
  otpVerifications.push({
    id: randomUUID(),
    email: email.toLowerCase(),
    otpHash: hashOtp(otp),
    purpose: 'register',
    attempts: 0,
    consumed: false,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  });

  res.status(200).json({
    message: 'OTP created successfully',
    otp,
    email,
    expiryMinutes: 5
  });
});

router.post('/verify-otp', async (req, res) => {
  const { email, password, otp, gender } = req.body || {};
  if (!email || !password || !otp || !gender) {
    res.status(400).json({ message: 'email, password, otp and gender are required' });
    return;
  }

  const record = [...otpVerifications]
    .filter((entry) => entry.email.toLowerCase() === String(email).toLowerCase())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  if (!record) {
    res.status(404).json({ message: 'No OTP found for this email' });
    return;
  }

  if (record.consumed || new Date(record.expiresAt).getTime() < Date.now()) {
    res.status(410).json({ message: 'OTP has expired or already been used' });
    return;
  }

  if (record.attempts >= 5) {
    res.status(429).json({ message: 'Too many OTP attempts' });
    return;
  }

  const candidate = hashOtp(String(otp));
  if (candidate !== record.otpHash) {
    record.attempts += 1;
    res.status(400).json({ message: 'Invalid OTP' });
    return;
  }

  const existing = getUserByEmail(email);
  if (existing) {
    res.status(409).json({ message: 'User already registered' });
    return;
  }

  const user: User = {
    id: randomUUID(),
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 12),
    gender,
    role: 'user',
    status: 'active',
    username: generateUsername(email.split('@')[0], email),
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(user);
  createWalletForUser(user.id);
  createEarningsWalletForUser(user.id);
  profiles.push({
    userId: user.id,
    name: '',
    displayName: '',
    city: '',
    language: 'english',
    hobbies: [],
    isOnline: false
  });
  record.consumed = true;

  const tokens = signTokens(user);
  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      gender: user.gender,
      role: user.role
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ message: 'email and password are required' });
    return;
  }

  const user = getUserByEmail(email);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const tokens = signTokens(user);
  res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      gender: user.gender,
      role: user.role
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  });
});

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) {
    res.status(400).json({ message: 'refreshToken is required' });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, config.refreshSecret) as { userId: string };
    const user = users.find((entry) => entry.id === decoded.userId);
    if (!user) {
      res.status(401).json({ message: 'Refresh token is invalid' });
      return;
    }
    const tokens = signTokens(user);
    res.status(200).json(tokens);
  } catch (error) {
    res.status(401).json({ message: 'Refresh token expired or invalid' });
  }
});

export default router;
