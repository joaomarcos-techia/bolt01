/*
  # Sistema de Administrador Exclusivo

  1. Tabela de Administradores
    - `admin_users` - Lista de usuários administradores
    - Apenas emails específicos podem ser admin
    - Sistema de permissões granulares

  2. Segurança
    - RLS habilitado
    - Apenas admins podem ver dados de admin
    - Verificação por email específico

  3. Funcionalidades Admin
    - Visualizar todos os usuários
    - Gerenciar assinaturas
    - Acessar métricas globais
    - Logs de sistema
*/

-- Criar tabela de administradores
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  role text DEFAULT 'super_admin' NOT NULL,
  permissions jsonb DEFAULT '{"all": true}' NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  last_login timestamptz,
  CONSTRAINT valid_admin_email CHECK (email = 'seu-email@exemplo.com') -- SUBSTITUA PELO SEU EMAIL
);

-- Habilitar RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ver dados de admin
CREATE POLICY "Only admins can access admin data"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users 
      WHERE is_active = true
    )
  );

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se email pode ser admin
CREATE OR REPLACE FUNCTION can_be_admin(email_address text)
RETURNS boolean AS $$
BEGIN
  -- SUBSTITUA PELO SEU EMAIL REAL
  RETURN email_address = 'seu-email@exemplo.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auto-promover admin baseado no email
CREATE OR REPLACE FUNCTION auto_promote_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se o email pode ser admin
  IF can_be_admin(NEW.email) THEN
    INSERT INTO admin_users (user_id, email, role, created_at)
    VALUES (NEW.id, NEW.email, 'super_admin', now())
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para auto-promoção
DROP TRIGGER IF EXISTS auto_promote_admin_trigger ON auth.users;
CREATE TRIGGER auto_promote_admin_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auto_promote_admin();

-- Tabela de logs de admin
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES admin_users(user_id) NOT NULL,
  action text NOT NULL,
  target_type text, -- user, subscription, system
  target_id text,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS para logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ver logs
CREATE POLICY "Only admins can access logs"
  ON admin_logs FOR ALL
  TO authenticated
  USING (is_admin());

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_user ON admin_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);

-- View para estatísticas de admin
CREATE VIEW admin_dashboard_stats WITH (security_invoker = true) AS
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM stripe_customers) as total_customers,
  (SELECT COUNT(*) FROM stripe_subscriptions WHERE status IN ('active', 'trialing')) as active_subscriptions,
  (SELECT COUNT(*) FROM leads) as total_leads,
  (SELECT COUNT(*) FROM tasks) as total_tasks,
  (SELECT COUNT(*) FROM transactions) as total_transactions,
  (SELECT SUM(amount) FROM transactions WHERE type = 'income') as total_revenue
WHERE is_admin();

-- Conceder permissões
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- Função para log de ações admin
CREATE OR REPLACE FUNCTION log_admin_action(
  action_name text,
  target_type_param text DEFAULT NULL,
  target_id_param text DEFAULT NULL,
  details_param jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  IF is_admin() THEN
    INSERT INTO admin_logs (admin_user_id, action, target_type, target_id, details)
    VALUES (auth.uid(), action_name, target_type_param, target_id_param, details_param);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- IMPORTANTE: Substitua 'seu-email@exemplo.com' pelo seu email real
-- Exemplo de como inserir manualmente um admin (execute apenas uma vez):
-- INSERT INTO admin_users (user_id, email, role) 
-- SELECT id, email, 'super_admin' 
-- FROM auth.users 
-- WHERE email = 'SEU-EMAIL-REAL@DOMINIO.COM'
-- ON CONFLICT (user_id) DO NOTHING;