# 🔧 Guia de Recuperação - Importação Frascolife

## 📌 Situação Atual

O Supabase ficou travado devido a múltiplas tentativas de conexão durante a importação que falhou.

**Erro original:** Campos do CSV maiores que os limites definidos no schema.

**Solução:** Schema já foi corrigido com campos `Text` (ilimitados).

---

## ✅ Como Resolver

### **Passo 1: Restaurar o Supabase**

1. Acesse: https://supabase.com/dashboard/project/zpmesaugfemnrysafosv/settings/general
2. Clique em **"Pause project"**
3. Aguarde pausar (1-2 min)
4. Clique em **"Restore project"**
5. Aguarde ficar "Active" (~3 min)

---

### **Passo 2: Atualizar o Schema no Banco**

Depois que o Supabase voltar online, rode:

```bash
cd /Users/guilhermeteixeira/Documents/PROJETOS/frascolife
npx prisma db push
```

Isso vai aplicar as mudanças:
- ✅ `nomeFantasia`: VarChar(255) → Text
- ✅ `razaoSocial`: VarChar(255) → Text
- ✅ `logradouro`: VarChar(255) → Text
- ✅ `complemento`: VarChar(255) → Text
- ✅ `cnaeSecundario`: VarChar(500) → Text

---

### **Passo 3: Reimportar 1 Milhão de Registros**

```bash
npm run import:csv
```

**Tempo estimado:** 10-15 minutos
**Taxa esperada:** ~1000-2000 registros/segundo

Você verá o progresso assim:
```
📊 Progresso: 500,000/1,000,000 (50.0%) | 1234 reg/s | Erros: 0
```

---

### **Passo 4: Verificar Importação**

Depois que terminar, acesse o Supabase Table Editor:
https://supabase.com/dashboard/project/zpmesaugfemnrysafosv/editor

Ou rode um teste via código:

```bash
npx prisma studio
```

Isso abre uma interface visual no navegador para ver os dados.

---

## 🐛 **Se der erro novamente:**

### Erro: "Can't reach database server"
**Solução:** Aguardar mais 2-3 minutos. O Supabase demora para restaurar completamente.

### Erro: "Field too long"
**Solução:** O schema já foi corrigido. Apenas rode `npx prisma db push` novamente.

### Erro: "Out of memory"
**Solução:** O script já usa streams e batches. Não deve dar esse erro.

---

## 📊 **Após Importação Completa**

Você terá:
- ✅ 1 milhão de empresas no banco
- ✅ ~200-250 MB de storage usado
- ✅ Índices criados (UF, CNAE, situação cadastral)
- ✅ Pronto para criar o dashboard CRM

---

## 🚀 **Próximos Passos (Depois da Importação)**

1. Criar API REST com filtros
2. Dashboard Next.js
3. Integração com Twilio para cold calls
4. Implementar agente de IA com LangChain

---

**Qualquer dúvida, consulte o README.md**
