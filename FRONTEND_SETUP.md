# Frontend Setup - FrascoLife CRM

## 📋 O que foi criado até agora

### ✅ 1. Infraestrutura Backend
- ✅ Schema Prisma completo (companies, call_logs, campaigns, tags)
- ✅ Migrations SQL para autenticação (pre_users, profiles)
- ✅ Row Level Security (RLS) configurado
- ✅ Edge Function para ativação de conta

### ✅ 2. Dependências Instaladas
```json
{
  "@supabase/supabase-js": "^2.93.3",
  "@supabase/auth-helpers-nextjs": "^0.15.0",
  "libphonenumber-js": "^1.12.36",
  "zod": "^4.3.6",
  "react-hook-form": "^7.71.1",
  "lucide-react": "^0.563.0",
  "tailwindcss": "latest"
}
```

### ✅ 3. Arquivos Criados

#### Migrations SQL
```
supabase/migrations/
  └── 20260201000001_create_auth_tables.sql
      - Tabela pre_users (pré-cadastro)
      - Tabela profiles (perfil do usuário)
      - Políticas RLS
      - Functions auxiliares
```

#### Edge Functions
```
supabase/functions/
  ├── _shared/cors.ts
  └── activate-account/index.ts
      - Criar usuário no Supabase Auth
      - Criar profile
      - Atualizar pre_user.status
```

#### Lib (Utilitários)
```
src/lib/
  ├── supabase/client.ts (Supabase typed client)
  └── phone.ts (normalização E.164, validação)
```

#### Configuração
```
- tailwind.config.js
- postcss.config.js
- src/app/layout.tsx
- src/app/globals.css
```

---

## 🚧 PRÓXIMOS PASSOS

### **Passo 1: Aplicar Migrations no Supabase**

```bash
# Conectar ao Supabase (caso ainda não esteja)
supabase login

# Linkar o projeto
supabase link --project-ref zpmesaugfemnrysafosv

# Aplicar migrations
supabase db push
```

Ou aplicar manualmente via Supabase Dashboard → SQL Editor

---

### **Passo 2: Deploy da Edge Function**

```bash
# Deploy da função activate-account
supabase functions deploy activate-account

# Verificar se está rodando
supabase functions list
```

---

### **Passo 3: Criar Páginas de Autenticação** (A FAZER)

Ainda precisam ser criados:

#### 3.1 Página de Login
```
src/app/login/page.tsx
- Input: email OU telefone
- Input: senha
- Botão: Entrar
- Link: Esqueci a senha
- Link: Primeiro acesso
```

**Lógica:**
- Detectar se identificador é email ou telefone
- Se telefone → normalizar → buscar email
- Autenticar com `supabase.auth.signInWithPassword()`

#### 3.2 Página de Primeiro Acesso
```
src/app/primeiro-acesso/page.tsx
- Step 1: Verificar se pre_user existe
- Step 2: Criar senha
- Step 3: Ativar conta via Edge Function
- Redirect: /login com mensagem de sucesso
```

#### 3.3 Página de Reset de Senha
```
src/app/esqueci-senha/page.tsx
- Input: email OU telefone
- Enviar link de reset
src/app/reset-password/page.tsx
- Nova senha + confirmar
- Chamar `supabase.auth.updateUser({ password })`
```

#### 3.4 Dashboard (Área Logada)
```
src/app/dashboard/page.tsx
- Tabela de empresas (companies)
- Filtros avançados (UF, CNAE, situação)
- Paginação
- Export CSV
```

---

### **Passo 4: Atualizar .env com Supabase**

Adicionar no `.env`:

```env
# Já existe (do banco companies)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# ADICIONAR (para autenticação)
NEXT_PUBLIC_SUPABASE_URL="https://zpmesaugfemnrysafosv.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." (secret)
```

---

## 📝 Exemplo de Fluxo Completo

### 1. Admin cria pré-cadastro

```sql
INSERT INTO public.pre_users (email, phone, full_name, role, status, created_by)
VALUES ('joao@example.com', '+5511999999999', 'João Silva', 'user', 'invited', 'admin-uuid');
```

### 2. Usuário acessa /primeiro-acesso

- Digita: `11999999999` ou `joao@example.com`
- Sistema normaliza telefone → `+5511999999999`
- Busca pre_user → encontrado com status `invited`
- Solicita criação de senha

### 3. Usuário define senha

- Edge Function cria usuário no Supabase Auth
- Cria registro em profiles
- Atualiza pre_user.status = 'active'

### 4. Redirect para /login

- Campo identifier pré-preenchido
- Usuário faz login
- Redirect para /dashboard

---

## 🎨 Componentes UI Necessários

Para criar as páginas, você vai precisar de:

### Componentes Básicos
- Input (email/telefone/senha)
- Button
- Card
- Alert (mensagens de erro/sucesso)
- Loading spinner

### Componentes do Dashboard
- Table (lista de empresas)
- Pagination
- Filters (dropdown UF, CNAE, etc)
- SearchBar
- Modal

Recomendo usar **shadcn/ui** para componentes prontos:

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card table
```

---

## 🔐 Exemplo de Login (Código)

```typescript
// src/app/login/page.tsx
import { detectIdentifierType, normalizePhone } from '@/lib/phone'
import { createBrowserClient } from '@/lib/supabase/client'

async function handleLogin(identifier: string, password: string) {
  const supabase = createBrowserClient()

  // Detectar tipo
  const type = detectIdentifierType(identifier)

  let email = identifier

  // Se for telefone, buscar email
  if (type === 'phone') {
    const normalized = normalizePhone(identifier)
    if (!normalized) {
      throw new Error('Telefone inválido')
    }

    const { data } = await supabase.rpc('get_email_by_phone', {
      p_phone: normalized
    })

    if (!data) {
      throw new Error('Telefone não encontrado')
    }

    email = data
  }

  // Autenticar
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error

  // Redirect para dashboard
  window.location.href = '/dashboard'
}
```

---

## ✅ STATUS DA IMPORTAÇÃO

A importação de 1M registros está rodando em background.
Para verificar o progresso, rode:

```bash
# Ver últimas linhas do output
tail -f /caminho/do/log
```

---

## 🚀 Próximo Comando

Quando estiver pronto para criar as páginas de autenticação:

```bash
# Instalar shadcn/ui (componentes prontos)
npx shadcn-ui@latest init

# Adicionar componentes
npx shadcn-ui@latest add button input card form label
```

---

**Dúvidas?** Consulte:
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma Docs](https://www.prisma.io/docs)
