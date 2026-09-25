"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: Number(process.env.PORT || 4000),
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
    refreshSecret: process.env.REFRESH_SECRET || 'dev-refresh-secret',
    razorpaySecret: process.env.RAZORPAY_SECRET || 'demo-razorpay-secret'
};
