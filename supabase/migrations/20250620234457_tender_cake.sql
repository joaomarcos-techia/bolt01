-- Complete database reset - removes all data and resets everything

-- Delete all data from public tables (in order to respect foreign key constraints)
DELETE FROM automation_logs;
DELETE FROM automations;
DELETE FROM notifications;
DELETE FROM insights;
DELETE FROM integrations;
DELETE FROM admin_logs;
DELETE FROM admin_users;
DELETE FROM stripe_orders;
DELETE FROM stripe_subscriptions;
DELETE FROM stripe_customers;
DELETE FROM transactions;
DELETE FROM categories;
DELETE FROM accounts;
DELETE FROM task_assignments;
DELETE FROM tasks;
DELETE FROM lead_tags;
DELETE FROM tags;
DELETE FROM conversations;
DELETE FROM leads;
DELETE FROM profiles;

-- Delete all users from auth.users table
-- Note: This requires service role permissions
DELETE FROM auth.users;

-- Reset any sequences if they exist
-- This ensures that new accounts will start with fresh IDs
DO $$
DECLARE
    seq_record RECORD;
BEGIN
    FOR seq_record IN 
        SELECT schemaname, sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER SEQUENCE ' || seq_record.schemaname || '.' || seq_record.sequencename || ' RESTART WITH 1';
    END LOOP;
END $$;

-- Clear any cached sessions or tokens
-- This is handled at the application level, not database level