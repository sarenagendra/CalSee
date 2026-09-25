import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  refreshSecret: process.env.REFRESH_SECRET || 'dev-refresh-secret',
  razorpaySecret: process.env.RAZORPAY_SECRET || 'demo-razorpay-secret'
};
