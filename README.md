# CalSee Backend

This project is a TypeScript Express backend starter built from the architecture brief for a dating and per-minute calling platform. It includes the main building blocks for authentication, profile completion, wallet management, call billing, complaint handling, and admin visibility in a runnable codebase.

## Features

- Email OTP registration and JWT-based authentication
- Profile completion and female-only bank details flow
- Recharge plans and wallet credit/debit logic
- Server-authoritative call billing simulation
- Earnings tracking for women and payout preparation
- Masked admin views and complaint blocking workflow
- In-memory persistence suitable for local development and prototyping

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Test

```bash
npm test
```

## Example API routes

- POST /auth/register
- POST /auth/verify-otp
- POST /auth/login
- GET /wallet/plans
- POST /wallet/recharge/verify
- POST /calls/initiate
- POST /complaints
- GET /admin/users

## Notes

This starter uses an in-memory store to keep the project runnable in a lightweight environment. For a production deployment, replace the store with PostgreSQL and add the real payment and WebSocket integrations described in the architecture document.
