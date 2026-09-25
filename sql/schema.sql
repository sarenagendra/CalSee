CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'support')),
  status VARCHAR(15) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  city VARCHAR(100),
  language VARCHAR(30) NOT NULL,
  hobbies TEXT[],
  avatar_url TEXT,
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ
);

CREATE TABLE wallets (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  balance_paise BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE earnings_wallet (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  balance_paise BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE calls (
  id UUID PRIMARY KEY,
  caller_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(15) NOT NULL DEFAULT 'ringing',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  billed_seconds INT NOT NULL DEFAULT 0,
  amount_charged_paise BIGINT NOT NULL DEFAULT 0,
  amount_earned_paise BIGINT NOT NULL DEFAULT 0,
  end_reason VARCHAR(20)
);

CREATE TABLE complaints (
  id UUID PRIMARY KEY,
  complainant_id UUID NOT NULL REFERENCES users(id),
  accused_id UUID NOT NULL REFERENCES users(id),
  call_id UUID REFERENCES calls(id),
  reason TEXT NOT NULL,
  evidence_url TEXT,
  status VARCHAR(15) NOT NULL DEFAULT 'open',
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE user_blocks (
  id UUID PRIMARY KEY,
  blocked_user_id UUID NOT NULL REFERENCES users(id),
  protected_user_id UUID NOT NULL REFERENCES users(id),
  complaint_id UUID REFERENCES complaints(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(blocked_user_id, protected_user_id)
);
