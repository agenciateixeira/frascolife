-- Migration: Criar tabelas de autenticação e perfis
-- Data: 2026-02-01

-- =====================================================
-- 1. TABELA PRE_USERS (Pré-cadastro feito pelo admin)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pre_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'disabled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: deve ter email OU telefone
  CONSTRAINT pre_users_contact_check CHECK (
    email IS NOT NULL OR phone IS NOT NULL
  )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pre_users_email ON public.pre_users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pre_users_phone ON public.pre_users(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pre_users_status ON public.pre_users(status);

-- Comentários
COMMENT ON TABLE public.pre_users IS 'Pré-cadastro de usuários feito pelo admin antes da ativação';
COMMENT ON COLUMN public.pre_users.phone IS 'Telefone no formato E.164 (ex: +5511999999999)';
COMMENT ON COLUMN public.pre_users.status IS 'invited: aguardando ativação | active: conta ativa | disabled: desativado';

-- =====================================================
-- 2. TABELA PROFILES (Perfil do usuário logado)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Comentários
COMMENT ON TABLE public.profiles IS 'Perfil dos usuários autenticados (sincronizado com auth.users)';
COMMENT ON COLUMN public.profiles.id IS 'Mesmo ID do auth.users';
COMMENT ON COLUMN public.profiles.phone IS 'Telefone no formato E.164';

-- =====================================================
-- 3. FUNCTION: Atualizar updated_at automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER set_pre_users_updated_at
  BEFORE UPDATE ON public.pre_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.pre_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS: PRE_USERS
-- =====================================================

-- Admin pode ver todos os pré-cadastros
CREATE POLICY "Admins can view all pre_users"
  ON public.pre_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin pode criar pré-cadastros
CREATE POLICY "Admins can insert pre_users"
  ON public.pre_users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin pode atualizar pré-cadastros
CREATE POLICY "Admins can update pre_users"
  ON public.pre_users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Usuários podem ver SEU PRÓPRIO pre_user (para primeiro acesso)
-- Necessário para validar email/telefone no fluxo de ativação
CREATE POLICY "Users can view own pre_user by email or phone"
  ON public.pre_users
  FOR SELECT
  USING (
    email IN (SELECT email FROM auth.users WHERE id = auth.uid())
    OR phone IN (SELECT phone FROM auth.users WHERE id = auth.uid())
  );

-- =====================================================
-- POLÍTICAS RLS: PROFILES
-- =====================================================

-- Usuário pode ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Usuário pode atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admin pode ver todos os perfis
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admin pode atualizar todos os perfis
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- System pode inserir profiles (via Edge Function)
CREATE POLICY "Service role can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 5. FUNCTION: Buscar email por telefone
-- =====================================================
-- Usada no login quando usuário digita telefone
CREATE OR REPLACE FUNCTION public.get_email_by_phone(p_phone TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Buscar primeiro em profiles (usuários ativos)
  RETURN (
    SELECT email
    FROM public.profiles
    WHERE phone = p_phone
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. FUNCTION: Verificar se pre_user existe
-- =====================================================
-- Usada no primeiro acesso
CREATE OR REPLACE FUNCTION public.check_pre_user_exists(
  p_identifier TEXT
)
RETURNS TABLE (
  user_exists BOOLEAN,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  role TEXT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TRUE as user_exists,
    pu.email,
    pu.phone,
    pu.full_name,
    pu.role,
    pu.status
  FROM public.pre_users pu
  WHERE (pu.email = p_identifier OR pu.phone = p_identifier)
    AND pu.status = 'invited'
  LIMIT 1;

  -- Se não encontrou nada, retornar FALSE
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. GRANTS (Permissões)
-- =====================================================

-- Permitir acesso autenticado às tabelas
GRANT SELECT, INSERT, UPDATE ON public.pre_users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Permitir acesso anônimo às functions de verificação
GRANT EXECUTE ON FUNCTION public.get_email_by_phone TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_pre_user_exists TO anon, authenticated;
