/*
  # Stripe Integration Tables

  1. New Tables
    - `stripe_customers`
      - `id` (bigint, primary key)
      - `user_id` (uuid, references auth.users)
      - `customer_id` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `deleted_at` (timestamp, nullable)
    
    - `stripe_subscriptions`
      - `id` (bigint, primary key)
      - `customer_id` (text, unique)
      - `subscription_id` (text, nullable)
      - `price_id` (text, nullable)
      - `current_period_start` (bigint, nullable)
      - `current_period_end` (bigint, nullable)
      - `cancel_at_period_end` (boolean)
      - `payment_method_brand` (text, nullable)
      - `payment_method_last4` (text, nullable)
      - `status` (stripe_subscription_status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `deleted_at` (timestamp, nullable)
    
    - `stripe_orders`
      - `id` (bigint, primary key)
      - `checkout_session_id` (text)
      - `payment_intent_id` (text)
      - `customer_id` (text)
      - `amount_subtotal` (bigint)
      - `amount_total` (bigint)
      - `currency` (text)
      - `payment_status` (text)
      - `status` (stripe_order_status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `deleted_at` (timestamp, nullable)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to view their own data
    
  3. Views
    - `stripe_user_subscriptions` - User's subscription data
    - `stripe_user_orders` - User's order data
*/

-- Create enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE stripe_subscription_status AS ENUM (
        'not_started',
        'incomplete',
        'incomplete_expired',
        'trialing',
        'active',
        'past_due',
        'canceled',
        'unpaid',
        'paused'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE stripe_order_status AS ENUM (
        'pending',
        'completed',
        'canceled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) not null unique,
  customer_id text not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone default null
);

-- Enable RLS on stripe_customers
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

-- Create policy for stripe_customers if it doesn't exist
DO $$ BEGIN
    CREATE POLICY "Users can view their own customer data"
        ON stripe_customers
        FOR SELECT
        TO authenticated
        USING (user_id = auth.uid() AND deleted_at IS NULL);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create stripe_subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id bigint primary key generated always as identity,
  customer_id text unique not null,
  subscription_id text default null,
  price_id text default null,
  current_period_start bigint default null,
  current_period_end bigint default null,
  cancel_at_period_end boolean default false,
  payment_method_brand text default null,
  payment_method_last4 text default null,
  status stripe_subscription_status not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone default null
);

-- Enable RLS on stripe_subscriptions
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for stripe_subscriptions if it doesn't exist
DO $$ BEGIN
    CREATE POLICY "Users can view their own subscription data"
        ON stripe_subscriptions
        FOR SELECT
        TO authenticated
        USING (
            customer_id IN (
                SELECT customer_id
                FROM stripe_customers
                WHERE user_id = auth.uid() AND deleted_at IS NULL
            )
            AND deleted_at IS NULL
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create stripe_orders table
CREATE TABLE IF NOT EXISTS stripe_orders (
    id bigint primary key generated always as identity,
    checkout_session_id text not null,
    payment_intent_id text not null,
    customer_id text not null,
    amount_subtotal bigint not null,
    amount_total bigint not null,
    currency text not null,
    payment_status text not null,
    status stripe_order_status not null default 'pending',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone default null
);

-- Enable RLS on stripe_orders
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Create policy for stripe_orders if it doesn't exist
DO $$ BEGIN
    CREATE POLICY "Users can view their own order data"
        ON stripe_orders
        FOR SELECT
        TO authenticated
        USING (
            customer_id IN (
                SELECT customer_id
                FROM stripe_customers
                WHERE user_id = auth.uid() AND deleted_at IS NULL
            )
            AND deleted_at IS NULL
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create view for user subscriptions if it doesn't exist
CREATE OR REPLACE VIEW stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    s.subscription_id,
    s.status as subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND (s.deleted_at IS NULL OR s.deleted_at IS NULL);

-- Grant permissions on the view
GRANT SELECT ON stripe_user_subscriptions TO authenticated;

-- Create view for user orders if it doesn't exist
CREATE OR REPLACE VIEW stripe_user_orders WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    o.id as order_id,
    o.checkout_session_id,
    o.payment_intent_id,
    o.amount_subtotal,
    o.amount_total,
    o.currency,
    o.payment_status,
    o.status as order_status,
    o.created_at as order_date
FROM stripe_customers c
LEFT JOIN stripe_orders o ON c.customer_id = o.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND (o.deleted_at IS NULL OR o.deleted_at IS NULL);

-- Grant permissions on the view
GRANT SELECT ON stripe_user_orders TO authenticated;