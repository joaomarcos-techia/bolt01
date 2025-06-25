/*
  # Admin System Setup

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text, unique)
      - `role` (text, default 'super_admin')
      - `permissions` (jsonb, default '{"all": true}')
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)
      - `is_active` (boolean, default true)
      - `last_login` (timestamp)
    
    - `admin_logs`
      - `id` (uuid, primary key)
      - `admin_user_id` (uuid, references admin_users.user_id)
      - `action` (text)
      - `target_type` (text)
      - `target_id` (text)
      - `details` (jsonb)
      - `ip_address` (inet)
      - `user_agent` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for admin-only access
    - Add constraint to restrict admin email to joaomarcosrodduarte@gmail.com
    - Create function to check admin status
    - Auto-promote specific email to admin on user creation

  3. Views
    - `admin_dashboard_stats` - Aggregated statistics for admin dashboard

  4. Functions
    - `check_user_is_admin()` - Check if current user is admin
    - `is_admin()` - Alias for backward compatibility
    - `auto_promote_admin()` - Auto-promote trigger function
*/

-- Drop any existing admin-related functions to avoid conflicts
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS check_user_is_admin();

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'super_admin',
  permissions jsonb NOT NULL DEFAULT '{"all": true}',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  last_login timestamptz
);

-- Create indexes for admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create admin_logs table for audit trail
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES admin_users(user_id) NOT NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for admin_logs
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_user ON admin_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);

-- Enable RLS
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Add constraint to ensure only specific email can be admin
DO $$ BEGIN
  ALTER TABLE admin_users 
  ADD CONSTRAINT valid_admin_email 
  CHECK (email = 'joaomarcosrodduarte@gmail.com');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create function to check if user is admin (with unique name)
CREATE OR REPLACE FUNCTION check_user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  );
END;
$$;

-- Create policies for admin_users
DO $$ BEGIN
  CREATE POLICY "Only admins can access admin data"
    ON admin_users
    FOR ALL
    TO authenticated
    USING (auth.uid() IN (
      SELECT user_id FROM admin_users WHERE is_active = true
    ));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create policies for admin_logs
DO $$ BEGIN
  CREATE POLICY "Only admins can access logs"
    ON admin_logs
    FOR ALL
    TO authenticated
    USING (check_user_is_admin());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create trigger function for auto-promoting admin user
CREATE OR REPLACE FUNCTION auto_promote_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the new user has the admin email
  IF NEW.email = 'joaomarcosrodduarte@gmail.com' THEN
    -- Insert into admin_users table
    INSERT INTO admin_users (
      user_id,
      email,
      role,
      permissions,
      is_active
    ) VALUES (
      NEW.id,
      NEW.email,
      'super_admin',
      '{"all": true}',
      true
    ) ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-promote admin on user creation
DROP TRIGGER IF EXISTS auto_promote_admin_trigger ON auth.users;
CREATE TRIGGER auto_promote_admin_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_promote_admin();

-- Create admin dashboard stats view (corrected syntax)
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM stripe_customers WHERE deleted_at IS NULL) as total_customers,
  (SELECT COUNT(*) FROM stripe_subscriptions WHERE status IN ('active', 'trialing') AND deleted_at IS NULL) as active_subscriptions,
  (SELECT COUNT(*) FROM leads) as total_leads,
  (SELECT COUNT(*) FROM tasks) as total_tasks,
  (SELECT COUNT(*) FROM transactions) as total_transactions,
  (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'income') as total_revenue;

-- Grant access to admin view
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- Update stripe policies to allow admin access
DO $$ BEGIN
  CREATE POLICY "Admins can view all customers"
    ON stripe_customers
    FOR SELECT
    TO authenticated
    USING (check_user_is_admin());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all subscriptions"
    ON stripe_subscriptions
    FOR SELECT
    TO authenticated
    USING (check_user_is_admin());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create alias function for backward compatibility (if needed)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN check_user_is_admin();
END;
$$;