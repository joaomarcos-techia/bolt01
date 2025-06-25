/*
  # Sistema de Acesso Gratuito para Usuário Específico

  1. Atualização da Constraint
    - Remove a constraint restritiva do email admin
    - Permite que qualquer email seja admin (será controlado pela aplicação)

  2. Funcionalidade
    - O usuário "joaogestor.ia@gmail.com" terá acesso completo sem pagamento
    - Outros usuários continuam precisando de assinatura ativa
    - Controle feito no nível da aplicação para maior flexibilidade
*/

-- Remove a constraint restritiva de email para admin_users
-- Isso permite maior flexibilidade no controle de acesso
DO $$ BEGIN
  ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS valid_admin_email;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Atualiza a função de auto-promoção para incluir o usuário específico
CREATE OR REPLACE FUNCTION auto_promote_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Lista de emails que podem ser admin
  IF NEW.email IN ('joaomarcosrodduarte@gmail.com', 'joaogestor.ia@gmail.com') THEN
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

-- Comentário explicativo sobre o sistema de acesso gratuito
COMMENT ON FUNCTION auto_promote_admin() IS 'Auto-promove usuários específicos para admin. O usuário joaogestor.ia@gmail.com tem acesso VIP gratuito controlado pela aplicação.';