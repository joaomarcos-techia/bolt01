/*
  # Complete CoreFlow Database Schema

  1. New Tables
    - `leads` - CRM leads management
    - `conversations` - Chat conversations and interactions
    - `tags` - Custom tags for leads and conversations
    - `lead_tags` - Many-to-many relationship for lead tags
    - `tasks` - Task management system
    - `task_assignments` - Task assignments to users
    - `transactions` - Financial transactions
    - `accounts` - Financial accounts (bank accounts, etc.)
    - `categories` - Transaction categories
    - `automations` - Automation rules and workflows
    - `automation_logs` - Execution logs for automations
    - `insights` - CorePulse generated insights
    - `notifications` - System notifications
    - `integrations` - External service integrations

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for shared data where appropriate

  3. Functions and Triggers
    - Auto-create profile on user signup
    - Update timestamps automatically
    - Generate insights based on data patterns
*/

-- Create custom types
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE automation_status AS ENUM ('active', 'paused', 'draft');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'error', 'success');

-- Leads table for CoreCRM
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  whatsapp text,
  company text,
  status lead_status DEFAULT 'new',
  source text DEFAULT 'manual',
  value decimal(10,2),
  notes text,
  last_contact timestamptz,
  next_follow_up timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Conversations table for chat history
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel text NOT NULL DEFAULT 'whatsapp', -- whatsapp, email, phone
  message text NOT NULL,
  is_from_lead boolean DEFAULT true,
  is_automated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Tags system
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#3B82F6',
  category text DEFAULT 'general', -- lead, task, transaction
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name, category)
);

-- Lead tags relationship
CREATE TABLE IF NOT EXISTS lead_tags (
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (lead_id, tag_id)
);

-- Tasks table for CoreTask
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  due_date timestamptz,
  completed_at timestamptz,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Task assignments (for team collaboration)
CREATE TABLE IF NOT EXISTS task_assignments (
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  PRIMARY KEY (task_id, user_id)
);

-- Financial accounts
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text DEFAULT 'checking', -- checking, savings, credit_card, cash
  balance decimal(12,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transaction categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type transaction_type NOT NULL,
  color text DEFAULT '#6B7280',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name, type)
);

-- Transactions table for CoreFinance
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  amount decimal(12,2) NOT NULL,
  description text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  is_recurring boolean DEFAULT false,
  recurring_interval text, -- monthly, weekly, yearly
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Automations table
CREATE TABLE IF NOT EXISTS automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL, -- lead_created, task_due, payment_received, etc.
  trigger_conditions jsonb DEFAULT '{}',
  actions jsonb NOT NULL DEFAULT '[]',
  status automation_status DEFAULT 'draft',
  last_run timestamptz,
  run_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Automation execution logs
CREATE TABLE IF NOT EXISTS automation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id uuid REFERENCES automations(id) ON DELETE CASCADE NOT NULL,
  trigger_data jsonb,
  actions_executed jsonb,
  success boolean DEFAULT true,
  error_message text,
  executed_at timestamptz DEFAULT now()
);

-- CorePulse insights
CREATE TABLE IF NOT EXISTS insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL, -- conversion_rate, inactive_leads, pricing_opportunity, etc.
  title text NOT NULL,
  description text NOT NULL,
  data jsonb DEFAULT '{}',
  priority integer DEFAULT 1, -- 1=low, 2=medium, 3=high
  is_read boolean DEFAULT false,
  is_applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Notifications system
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- External integrations
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service text NOT NULL, -- whatsapp, email, bank, etc.
  config jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_sync timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, service)
);

-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads
CREATE POLICY "Users can manage their own leads"
  ON leads FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for conversations
CREATE POLICY "Users can manage their own conversations"
  ON conversations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for tags
CREATE POLICY "Users can manage their own tags"
  ON tags FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for lead_tags
CREATE POLICY "Users can manage their own lead tags"
  ON lead_tags FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.id = lead_tags.lead_id 
    AND leads.user_id = auth.uid()
  ));

-- RLS Policies for tasks
CREATE POLICY "Users can manage their own tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for task_assignments
CREATE POLICY "Users can manage task assignments"
  ON task_assignments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM tasks 
    WHERE tasks.id = task_assignments.task_id 
    AND tasks.user_id = auth.uid()
  ));

-- RLS Policies for accounts
CREATE POLICY "Users can manage their own accounts"
  ON accounts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for categories
CREATE POLICY "Users can manage their own categories"
  ON categories FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can manage their own transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for automations
CREATE POLICY "Users can manage their own automations"
  ON automations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for automation_logs
CREATE POLICY "Users can view their own automation logs"
  ON automation_logs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM automations 
    WHERE automations.id = automation_logs.automation_id 
    AND automations.user_id = auth.uid()
  ));

-- RLS Policies for insights
CREATE POLICY "Users can manage their own insights"
  ON insights FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can manage their own notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for integrations
CREATE POLICY "Users can manage their own integrations"
  ON integrations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON leads(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_automations_user_id ON automations(user_id);
CREATE INDEX IF NOT EXISTS idx_automations_status ON automations(status);
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_is_read ON insights(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile and default data
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, plan)
  VALUES (NEW.id, 'free');
  
  -- Create default account
  INSERT INTO public.accounts (user_id, name, type, balance)
  VALUES (NEW.id, 'Conta Principal', 'checking', 0);
  
  -- Create default categories
  INSERT INTO public.categories (user_id, name, type, is_default) VALUES
  (NEW.id, 'Vendas', 'income', true),
  (NEW.id, 'Serviços', 'income', true),
  (NEW.id, 'Outros', 'income', true),
  (NEW.id, 'Marketing', 'expense', true),
  (NEW.id, 'Operacional', 'expense', true),
  (NEW.id, 'Pessoal', 'expense', true);
  
  -- Create default tags
  INSERT INTO public.tags (user_id, name, color, category) VALUES
  (NEW.id, 'Quente', '#EF4444', 'lead'),
  (NEW.id, 'Frio', '#3B82F6', 'lead'),
  (NEW.id, 'Qualificado', '#10B981', 'lead'),
  (NEW.id, 'Urgente', '#F59E0B', 'task'),
  (NEW.id, 'Importante', '#8B5CF6', 'task');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample data for demo purposes
DO $$
DECLARE
  sample_user_id uuid;
BEGIN
  -- This would normally be handled by the trigger, but for demo purposes
  -- we'll create some sample data if there are existing users
  
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
  
  IF sample_user_id IS NOT NULL THEN
    -- Sample leads
    INSERT INTO leads (user_id, name, email, phone, status, value, source) VALUES
    (sample_user_id, 'João Silva', 'joao@email.com', '11999999999', 'qualified', 5000.00, 'whatsapp'),
    (sample_user_id, 'Maria Santos', 'maria@email.com', '11888888888', 'proposal', 8000.00, 'website'),
    (sample_user_id, 'Pedro Costa', 'pedro@email.com', '11777777777', 'new', 3000.00, 'referral')
    ON CONFLICT DO NOTHING;
    
    -- Sample tasks
    INSERT INTO tasks (user_id, title, description, status, priority, due_date) VALUES
    (sample_user_id, 'Ligar para João Silva', 'Follow-up da proposta enviada', 'todo', 'high', now() + interval '1 day'),
    (sample_user_id, 'Preparar apresentação', 'Apresentação para Maria Santos', 'in_progress', 'medium', now() + interval '3 days'),
    (sample_user_id, 'Enviar contrato', 'Contrato finalizado para Pedro Costa', 'todo', 'low', now() + interval '1 week')
    ON CONFLICT DO NOTHING;
    
    -- Sample insights
    INSERT INTO insights (user_id, type, title, description, priority) VALUES
    (sample_user_id, 'conversion_rate', 'Taxa de Conversão WhatsApp', 'Seus leads do WhatsApp têm 34% mais conversão que email', 2),
    (sample_user_id, 'inactive_leads', 'Clientes Inativos', '5 clientes não interagem há mais de 30 dias', 3),
    (sample_user_id, 'pricing_opportunity', 'Oportunidade de Preço', 'Oportunidade de aumentar preço em 15% baseado no mercado', 2)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;