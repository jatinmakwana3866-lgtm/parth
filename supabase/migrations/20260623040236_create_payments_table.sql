/*
# Create payments table for Razorpay payment tracking

1. New Tables
- `payments` — tracks Razorpay payment attempts and completions
  - `id` (uuid, primary key, default gen_random_uuid())
  - `user_uid` (uuid, references auth.users, not null)
  - `razorpay_payment_id` (text, nullable — filled after successful payment)
  - `razorpay_order_id` (text, not null)
  - `razorpay_signature` (text, nullable — filled after successful payment)
  - `amount` (integer, not null — amount in paise)
  - `currency` (text, default 'INR')
  - `status` (text, default 'created')
  - `tokens_purchased` (integer, not null)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on payments table
- Owner-scoped policies: each authenticated user can only access their own payment records
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uid uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_payment_id text DEFAULT '',
  razorpay_order_id text NOT NULL,
  razorpay_signature text DEFAULT '',
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'created',
  tokens_purchased integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_payments" ON payments;
CREATE POLICY "select_own_payments" ON payments FOR SELECT
  TO authenticated USING (auth.uid() = user_uid);

DROP POLICY IF EXISTS "insert_own_payments" ON payments;
CREATE POLICY "insert_own_payments" ON payments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_uid);

DROP POLICY IF EXISTS "update_own_payments" ON payments;
CREATE POLICY "update_own_payments" ON payments FOR UPDATE
  TO authenticated USING (auth.uid() = user_uid) WITH CHECK (auth.uid() = user_uid);

DROP POLICY IF EXISTS "delete_own_payments" ON payments;
CREATE POLICY "delete_own_payments" ON payments FOR DELETE
  TO authenticated USING (auth.uid() = user_uid);
