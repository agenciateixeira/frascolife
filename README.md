# FrascoLife CRM - Sistema de Cold Calling com IA

Sistema CRM otimizado para gerenciar 1M+ leads de CNPJ com agente de IA para cold calling.

## 🎯 Tecnologias

- **Frontend:** Next.js 14 + TypeScript + React
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **AI:** OpenAI / Anthropic Claude (futuro)

## 📊 Capacidade

- ✅ 1 milhão de registros no free tier
- ✅ Filtros avançados por UF, CNAE, situação cadastral
- ✅ Histórico de chamadas
- ✅ Campanhas de cold calling
- ✅ Tags e segmentação

## 🚀 Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite `.env` e adicione sua connection string do Supabase:

```env
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.xxxxx.supabase.co:5432/postgres"
```

### 3. Gerar Prisma Client e criar tabelas

```bash
npm run db:generate
npm run db:push
```

### 4. Importar dados do CSV

**IMPORTANTE:** O script importa 1 milhão de registros do arquivo `cnpj.csv`.

```bash
npm run import:csv
```

Progresso esperado:
- ⏱️ Tempo: ~10-15 minutos
- 📊 Taxa: ~1000-2000 registros/segundo
- 💾 Tamanho final: ~200-250 MB no banco

## 📁 Estrutura do Projeto

```
frascolife/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── scripts/
│   └── import-csv.ts          # Script de importação
├── src/
│   ├── app/                   # Next.js App Router (futuro)
│   └── lib/                   # Utilitários (futuro)
├── cnpj.csv                   # Arquivo de dados (4.75M registros)
└── package.json
```

## 🗄️ Schema do Banco

### Tabela: `companies`
Dados das empresas (CNPJ, endereço, contatos, CNAE)

### Tabela: `call_logs`
Histórico de chamadas com transcrições e análise de sentimento

### Tabela: `campaigns`
Campanhas de cold calling com filtros e estatísticas

### Tabela: `tags`
Tags para segmentação de leads

## 🔍 Índices Otimizados

O schema inclui índices em:
- `uf` - Filtrar por estado
- `cnaePrincipal` - Filtrar por atividade
- `situacaoCadastral` - Empresas ativas/inativas
- `matrizFilial` - Matriz ou filial
- `municipio` - Filtrar por cidade
- `cnpjBase` - Buscar grupo empresarial

## 📝 Próximos Passos

1. ✅ Importar 1M registros
2. [ ] Criar dashboard Next.js
3. [ ] Implementar filtros avançados
4. [ ] Integrar API de telefonia (Twilio/Vonage)
5. [ ] Implementar agente de IA com LangChain
6. [ ] Sistema de filas para cold calls
7. [ ] Analytics e relatórios

## 🎨 Futuras Funcionalidades

- [ ] Dashboard com métricas em tempo real
- [ ] Filtros combinados (UF + CNAE + Situação)
- [ ] Export de listas filtradas
- [ ] Integração com WhatsApp
- [ ] Análise de sentimento das conversas
- [ ] Recomendação de leads similares (Vector DB)
- [ ] Gravação e transcrição automática

## 📞 Integração com IA (Planejado)

```typescript
// Exemplo de cold call automatizado
const result = await aiAgent.call({
  phone: company.telefone1,
  script: templates.apresentacao,
  leadData: {
    nomeFantasia: company.nomeFantasia,
    cnae: company.cnaePrincipal,
    uf: company.uf
  }
});
```

## 💰 Custos Estimados

**Free Tier (atual):**
- Supabase: $0 (até 500MB)
- Vercel: $0 (hospedagem)
- **Total: $0/mês**

**Produção (60M registros):**
- Supabase Pro: $25/mês
- Vercel Pro: $20/mês
- Twilio: ~$0.01/minuto
- OpenAI: ~$0.002/chamada
- **Total: ~$50-100/mês + uso**

## 📚 Documentação

- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)

---

Desenvolvido para FrascoLife 🚀
