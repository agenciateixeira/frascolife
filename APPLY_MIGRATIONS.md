# Como Aplicar as Migrations no Supabase

Como o banco está ocupado com a importação, você pode aplicar as migrations manualmente via Dashboard do Supabase.

## 📝 Passo a Passo

### 1. Acessar o SQL Editor

1. Acesse: https://supabase.com/dashboard/project/zpmesaugfemnrysafosv
2. No menu lateral, clique em **"SQL Editor"**
3. Clique em **"New query"**

### 2. Copiar o SQL

Abra o arquivo:
```
supabase/migrations/20260201000001_create_auth_tables.sql
```

Ou copie diretamente daqui:

```sql
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

-- [RESTO DO SQL...]
```

### 3. Executar

1. Cole todo o conteúdo do arquivo SQL no editor
2. Clique em **"Run"** (ou pressione Ctrl+Enter)
3. Aguarde a confirmação: **"Success. No rows returned"**

### 4. Verificar

Para verificar se as tabelas foram criadas, execute:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('pre_users', 'profiles');
```

Deve retornar:
```
pre_users
profiles
```

## ✅ Verificações Finais

### Verificar Políticas RLS

```sql
SELECT
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE tablename IN ('pre_users', 'profiles');
```

Deve mostrar várias políticas criadas.

### Verificar Functions

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('get_email_by_phone', 'check_pre_user_exists', 'handle_updated_at');
```

---

## 🚀 Após Aplicar

Quando a migration estiver aplicada, você pode:

1. **Criar um usuário admin manualmente** (via SQL):

```sql
-- Primeiro, criar um usuário no Supabase Auth (via Dashboard > Authentication > Users > Add User)
-- Email: admin@frascolife.com
-- Senha: (definir uma senha forte)

-- Depois, criar o profile
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  '[UUID-DO-USUARIO-CRIADO]',  -- Substituir pelo UUID do auth.users
  'admin@frascolife.com',
  'Administrador',
  'admin'
);
```

2. **Testar pré-cadastro**:

```sql
-- Admin cria pré-cadastro
INSERT INTO public.pre_users (email, phone, full_name, role, status, created_by)
VALUES (
  'joao@example.com',
  '+5511999999999',
  'João Silva',
  'user',
  'invited',
  '[UUID-DO-ADMIN]'  -- Substituir pelo ID do admin
);
```

---

## 🔧 Alternativa: Aguardar Importação

Se preferir, aguarde a importação de 1M registros terminar (~3 minutos restantes) e depois execute:

```bash
npx tsx scripts/run-migration.ts
```

---

## 📊 Monitorar Importação

Para ver o progresso da importação:

```bash
# Verificar quantos registros já foram importados
npx prisma studio
# Ou via SQL no Supabase:
SELECT COUNT(*) FROM companies;
```

---

**Arquivo de migration:** `supabase/migrations/20260201000001_create_auth_tables.sql`
