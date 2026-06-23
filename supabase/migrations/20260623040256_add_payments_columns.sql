/*
# Add missing columns to payments table

1. Changes
- Add `razorpay_order_id` (text) to track Razorpay order IDs
- Add `razorpay_signature` (text) to store payment verification signatures
- Add `currency` (text, default 'INR') to track payment currency
- Add `tokens_purchased` (integer) to track how many tokens were bought

2. Security
- Existing RLS policies remain unchanged
*/

ALTER TABLE payments
ADD COLUMN IF NOT EXISTS razorpay_order_id text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS razorpay_signature text DEFAULT '',
ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS tokens_purchased integer NOT NULL DEFAULT 0;
