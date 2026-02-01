# Setup Completo - Novo Banco Supabase

## ✅ Tudo Configurado com Sucesso!

### 🔧 Informações do Novo Projeto

**Project Reference ID**: `kqydikciidyiehrcyxuy`
**Region**: South America (São Paulo)
**Dashboard**: https://supabase.com/dashboard/project/kqydikciidyiehrcyxuy

### 📊 O Que Foi Feito

#### 1. ✅ Configuração do .env
```env
DATABASE_URL="postgresql://postgres:Gui1302569!@db.kqydikciidyiehrcyxuy.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://kqydikciidyiehrcyxuy.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 2. ✅ Schema Prisma Aplicado
- Tabela `companies` criada com todos os campos
- Índices em `uf` e `cnaePrincipal` para performance

#### 3. ✅ Migrations de Autenticação Aplicadas
- **Tabela `pre_users`**: Pré-cadastro de usuários (admin cria convites)
- **Tabela `profiles`**: Perfil do usuário após ativação
- **Row Level Security (RLS)**: Políticas de segurança configuradas
- **Functions SQL**:
  - `get_email_by_phone()`: Busca email por telefone
  - `check_pre_user_exists()`: Verifica pré-cadastro
  - `handle_updated_at()`: Trigger de atualização automática

#### 4. ✅ Edge Functions Deployed
- **`activate-account`**: https://kqydikciidyiehrcyxuy.supabase.co/functions/v1/activate-account
  - Criar usuário no Supabase Auth
  - Criar profile
  - Atualizar status do pre_user

#### 5. 🚀 Importação em Andamento
- **Status**: Rodando em background (~2.600 registros/segundo)
- **Meta**: 1.000.000 registros
- **Tempo estimado**: ~6-7 minutos
- **Progresso**: Pode ser acompanhado no terminal

---

## 📝 Próximos Passos (Frontend)

### Passo 1: Criar Páginas de Autenticação

Ainda precisam ser criadas as seguintes páginas:

#### 1.1 Login (`src/app/login/page.tsx`)
- Input: Email OU Telefone
- Input: Senha
- Botão: Entrar
- Link: Esqueci a senha
- Link: Primeiro acesso

**Fluxo:**
```typescript
// Detectar se é email ou telefone
const type = detectIdentifierType(identifier)

// Se for telefone, buscar email
if (type === 'phone') {
  const normalized = normalizePhone(identifier)
  const { data: email } = await supabase.rpc('get_email_by_phone', { p_phone: normalized })
}

// Autenticar
await supabase.auth.signInWithPassword({ email, password })
```

#### 1.2 Primeiro Acesso (`src/app/primeiro-acesso/page.tsx`)
- Step 1: Verificar se pre_user existe (email ou telefone)
- Step 2: Criar senha
- Step 3: Ativar conta via Edge Function
- Redirect: /login com mensagem de sucesso

**Fluxo:**
```typescript
// 1. Verificar pre_user
const { data } = await supabase.rpc('check_pre_user_exists', { p_identifier })

// 2. Ativar conta
await fetch(`${SUPABASE_URL}/functions/v1/activate-account`, {
  method: 'POST',
  body: JSON.stringify({ identifier, password })
})
```

#### 1.3 Reset de Senha
- `/esqueci-senha`: Solicitar reset via email
- `/reset-password`: Definir nova senha

#### 1.4 Dashboard (`src/app/dashboard/page.tsx`)
- Tabela de empresas com filtros (UF, CNAE, situação)
- Paginação
- Export CSV

---

## 🎨 Componentes UI Recomendados

Instalar **shadcn/ui** para componentes prontos:

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card form label table
```

### Componentes Necessários:
- Input (email/telefone/senha)
- Button
- Card
- Alert (mensagens de erro/sucesso)
- Loading spinner
- Table (lista de empresas)
- Pagination
- Filters (dropdown UF, CNAE)

---

## 🔐 Exemplo de Código: Login

```typescript
// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { detectIdentifierType, normalizePhone } from '@/lib/phone'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const type = detectIdentifierType(identifier)
      let email = identifier

      // Se for telefone, buscar email
      if (type === 'phone') {
        const normalized = normalizePhone(identifier)
        if (!normalized) throw new Error('Telefone inválido')

        const { data } = await supabase.rpc('get_email_by_phone', {
          p_phone: normalized
        })
        if (!data) throw new Error('Telefone não encontrado')
        email = data
      }

      // Autenticar
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Redirect
      window.location.href = '/dashboard'
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="Email ou Telefone"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
```

---

## 🔍 Verificar Importação

Para ver o progresso da importação:

```bash
# Ver output do processo em background
# (ID do processo está no terminal)

# Ou verificar diretamente no banco:
npx prisma studio
# Abrir tabela "companies" e ver quantidade de registros
```

---

## 📚 Documentação de Referência

- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Next.js App Router**: https://nextjs.org/docs/app
- **Prisma Docs**: https://www.prisma.io/docs
- **shadcn/ui**: https://ui.shadcn.com

---

## ✅ Checklist Final

- [x] Novo projeto Supabase criado
- [x] .env atualizado com novas credenciais
- [x] Schema Prisma aplicado (tabela companies)
- [x] Migrations de autenticação aplicadas (pre_users, profiles)
- [x] Edge Functions deployed (activate-account)
- [x] RLS e Functions SQL configuradas
- [x] Importação de 1M registros iniciada
- [ ] Páginas de autenticação (login, primeiro acesso, reset senha)
- [ ] Dashboard com filtros e listagem de empresas
- [ ] Criar usuário admin inicial
- [ ] Testar fluxo completo de autenticação

---

**Status**: ✅ Backend 100% pronto | 🚧 Frontend pendente
