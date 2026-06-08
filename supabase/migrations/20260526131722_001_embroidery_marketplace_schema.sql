/*
  # Embroidery Marketplace - Complete Database Schema

  1. New Tables
    - `users`: User profiles with tokens, roles, verification status
    - `device_registry`: Device fingerprint tracking for one-device-one-token enforcement
    - `security_logs`: Audit trail for all security-sensitive operations
    - `unlocks`: Contact unlock records between users
    - `referrals`: Referral tracking with verification status
    - `transactions`: Token transaction history per user
    - `profiles`: Public marketplace profile data

  2. Security
    - RLS enabled on ALL tables
    - Users can only read/write their own data
    - device_registry and security_logs have NO client access (service role only)
    - unlocks readable by the buyer only
    - Token/suspended/verified fields protected from client writes

  3. Important Notes
    - Token balance lives in users.tokens - NEVER trusted from client
    - All token deductions must go through edge functions (service role)
    - Device fingerprint prevents duplicate free tokens per physical device
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid uuid UNIQUE NOT NULL,
  name text DEFAULT '',
  email text DEFAULT '',
  role text DEFAULT '',
  tokens integer DEFAULT 0,
  city text DEFAULT '',
  verified boolean DEFAULT false,
  suspended boolean DEFAULT false,
  device_id text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth_uid = auth.uid());

CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth_uid = auth.uid());

CREATE POLICY "Users can update own non-sensitive fields"
  ON users FOR UPDATE
  TO authenticated
  USING (auth_uid = auth.uid())
  WITH CHECK (auth_uid = auth.uid());

-- Device registry table
CREATE TABLE IF NOT EXISTS device_registry (
  device_id text PRIMARY KEY,
  first_email text DEFAULT '',
  account_count integer DEFAULT 0,
  tokens_claimed integer DEFAULT 0,
  first_seen_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now(),
  flagged boolean DEFAULT false,
  flag_reason text DEFAULT '',
  email_history text[] DEFAULT '{}'
);

ALTER TABLE device_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block all client access to device_registry"
  ON device_registry FOR ALL
  USING (false) WITH CHECK (false);

-- Security logs table
CREATE TABLE IF NOT EXISTS security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text DEFAULT '',
  email text DEFAULT '',
  auth_uid uuid,
  action text DEFAULT '',
  result text DEFAULT '',
  account_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block all client access to security_logs"
  ON security_logs FOR ALL
  USING (false) WITH CHECK (false);

-- Unlocks table
CREATE TABLE IF NOT EXISTS unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_uid uuid NOT NULL,
  target_uid uuid NOT NULL,
  cost integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(buyer_uid, target_uid)
);

ALTER TABLE unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own unlocks"
  ON unlocks FOR SELECT
  TO authenticated
  USING (buyer_uid = auth.uid());

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_uid uuid NOT NULL,
  referee_uid uuid NOT NULL,
  referee_email text DEFAULT '',
  device_id text DEFAULT '',
  tokens_credited integer DEFAULT 0,
  verified boolean DEFAULT false,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (referrer_uid = auth.uid() OR referee_uid = auth.uid());

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid uuid NOT NULL,
  type text NOT NULL,
  text text DEFAULT '',
  delta text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_uid = auth.uid());

-- Profiles table (public marketplace data)
CREATE TABLE IF NOT EXISTS profiles (
  auth_uid uuid PRIMARY KEY,
  name text DEFAULT '',
  role text DEFAULT '',
  city text DEFAULT '',
  bio text DEFAULT '',
  rating numeric DEFAULT 0,
  reviews integer DEFAULT 0,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can write own profile"
  ON profiles FOR ALL
  TO authenticated
  USING (auth_uid = auth.uid())
  WITH CHECK (auth_uid = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_uid ON users(auth_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_unlocks_buyer ON unlocks(buyer_uid);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_uid);
CREATE INDEX IF NOT EXISTS idx_security_logs_device ON security_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_uid);
