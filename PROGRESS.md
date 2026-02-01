# FrascoLife CRM - Progresso da Implementação

## ✅ Concluído

### Fase 0: Fundação (100%)
- [x] Next.js 14 + TypeScript + Tailwind v3
- [x] Supabase Auth integrado
- [x] Login e primeiro acesso
- [x] Dashboard básico
- [x] Navegação sidebar

### Fase 1: Gestão de Leads - Parcial (70%)
- [x] Lista de leads com filtros avançados
- [x] Modal de detalhes do lead
- [x] Enriquecimento via BrasilAPI
- [x] Edição manual de contatos
- [x] Filtros: email, telefone, CNPJ, CNAE, situação, UF
- [x] Paginação
- [x] 106.940 leads importados (ATIVA + SUSPENSA)
- [x] Schema completo do CRM (Prisma)
- [x] Migração companies → leads
- [ ] Kanban view por estágio
- [ ] Mapa geolocalização
- [ ] Atribuir leads a vendedores
- [ ] Lead scoring automático

### Database (100%)
- [x] Prisma schema completo (25 models)
- [x] Migração companies → leads
- [x] Novas colunas CRM (stage, score, source, assigned_to_id, etc)
- [x] SQL para criar todas as tabelas
- [x] Índices para performance

---

## 🚧 Em Progresso

### Fase 1: Core CRM (30% concluído)

**Próximos passos imediatos:**

1. **Executar SQL no Supabase** ⏳
   - Abrir Supabase Dashboard
   - SQL Editor → Run `scripts/create-crm-tables.sql`
   - Criar todas as tabelas do CRM

2. **Criar primeiro usuário admin** ⏳
   ```bash
   npx tsx scripts/create-admin-user.ts
   ```

3. **Atualizar código existente** ⏳
   - Trocar `Company` por `Lead` em todos os arquivos
   - Atualizar imports do Prisma
   - Atualizar APIs (/api/leads, /api/stats, etc)
   - Atualizar componentes (LeadDetailModal, etc)

---

## 📋 Roadmap Detalhado

### Fase 1: Core CRM (3 semanas)

#### Semana 1: Migração e CRUD Básico
- [ ] Executar SQL das tabelas
- [ ] Criar primeiro admin
- [ ] Atualizar todo código Company → Lead
- [ ] Testar lista de leads
- [ ] Testar enriquecimento
- [ ] Testar edição manual

#### Semana 2: Oportunidades e Pipeline
- [ ] CRUD de Oportunidades
  - [ ] API: /api/opportunities (GET, POST, PATCH, DELETE)
  - [ ] Página /dashboard/opportunities
  - [ ] Kanban Board component
  - [ ] Card de oportunidade
  - [ ] Modal criar/editar oportunidade
  - [ ] Formulário com produtos
  - [ ] Cálculo automático de valor total

- [ ] Pipeline Kanban
  - [ ] Drag and drop entre estágios
  - [ ] Filtros (responsável, valor, período)
  - [ ] Ordenação
  - [ ] Estatísticas por estágio

#### Semana 3: Atividades, Tarefas e Timeline
- [ ] Timeline de Atividades
  - [ ] Component Activity
Item
  - [ ] Filtros por tipo, lead, usuário
  - [ ] Scroll infinito
  - [ ] Auto-criação ao fazer ações (call, email, etc)

- [ ] Sistema de Tarefas
  - [ ] CRUD de tarefas
  - [ ] API: /api/tasks
  - [ ] Página /dashboard/tasks
  - [ ] Kanban: TODO, IN_PROGRESS, DONE
  - [ ] Lembretes
  - [ ] Notificações

- [ ] Notas
  - [ ] Component Note no modal do lead
  - [ ] CRUD de notas
  - [ ] Rich text editor
  - [ ] Pinned notes

- [ ] Tags
  - [ ] CRUD de tags
  - [ ] Adicionar/remover tags em leads
  - [ ] Filtro por tags
  - [ ] Badge colorido

---

### Fase 2: Comunicação (3 semanas)

#### Semana 4: Twilio Voice (Chamadas)
- [ ] Setup Twilio
  - [ ] Criar conta Twilio
  - [ ] Comprar número
  - [ ] Configurar webhooks
  - [ ] Adicionar credentials no .env

- [ ] Integração Voice
  - [ ] lib/twilio/voice.ts
  - [ ] API: /api/calls/initiate
  - [ ] API: /api/calls/status
  - [ ] Webhook: /api/webhooks/twilio/voice

- [ ] Dialer Widget
  - [ ] Click-to-call
  - [ ] Popup durante chamada
  - [ ] Timer
  - [ ] Notas em tempo real
  - [ ] Finalizar chamada
  - [ ] Selecionar outcome

- [ ] Histórico de Chamadas
  - [ ] Página /dashboard/calls
  - [ ] Lista com filtros
  - [ ] Player de gravação
  - [ ] Ver transcrição

#### Semana 5: IA para Chamadas
- [ ] Setup OpenAI
  - [ ] Criar conta OpenAI
  - [ ] API keys no .env

- [ ] Whisper Transcription
  - [ ] lib/openai/transcription.ts
  - [ ] Processar gravação após chamada
  - [ ] Salvar transcrição no banco

- [ ] GPT-4 Analysis
  - [ ] lib/openai/analysis.ts
  - [ ] Resumo da conversa
  - [ ] Análise de sentimento
  - [ ] Extração de keywords
  - [ ] Pain points identificados
  - [ ] Próximos passos sugeridos
  - [ ] Probabilidade de conversão

- [ ] UI de Análise
  - [ ] Card com resumo
  - [ ] Badge de sentimento
  - [ ] Lista de keywords
  - [ ] Sugestões de follow-up

#### Semana 6: Email e WhatsApp
- [ ] SendGrid/Resend
  - [ ] Criar conta
  - [ ] Configurar domínio
  - [ ] API keys

- [ ] Email Outbound
  - [ ] lib/sendgrid/client.ts
  - [ ] API: /api/emails/send
  - [ ] Email Composer component
  - [ ] Templates
  - [ ] Merge tags ({{leadName}}, etc)
  - [ ] Anexos
  - [ ] Agendamento

- [ ] Email Tracking
  - [ ] Webhook: /api/webhooks/sendgrid
  - [ ] Track opens
  - [ ] Track clicks
  - [ ] Update no banco

- [ ] WhatsApp
  - [ ] Twilio WhatsApp setup
  - [ ] API: /api/whatsapp/send
  - [ ] Webhook: /api/webhooks/twilio/whatsapp
  - [ ] Chat interface
  - [ ] Templates aprovados
  - [ ] Media (imagem, doc, etc)

---

### Fase 3: Automação e Campanhas (2 semanas)

#### Semana 7: Campanhas
- [ ] CRUD Campanhas
  - [ ] API: /api/campaigns
  - [ ] Página /dashboard/campaigns
  - [ ] Criar campanha (tipo, segmentação)
  - [ ] Listar campanhas
  - [ ] Dashboard de campanha

- [ ] Segmentação
  - [ ] Filtros avançados reutilizáveis
  - [ ] Preview de leads selecionados
  - [ ] Salvar segmentação

- [ ] Execução
  - [ ] Cold Call: fila de discagem
  - [ ] Email: envio em massa
  - [ ] WhatsApp: envio em massa
  - [ ] Multi-channel: combinar canais

- [ ] Métricas
  - [ ] Total, contatados, qualificados, convertidos
  - [ ] Taxa de resposta
  - [ ] Taxa de conversão
  - [ ] Gráficos

#### Semana 8: Automações
- [ ] Workflow Builder
  - [ ] UI drag-and-drop
  - [ ] Triggers (lead criado, estágio mudado, etc)
  - [ ] Conditions (if/else)
  - [ ] Actions (enviar email, criar tarefa, etc)

- [ ] Lead Scoring Automático
  - [ ] Regras de pontuação
  - [ ] Atualização em tempo real
  - [ ] Triggers baseados em score

- [ ] Email Drip Campaigns
  - [ ] Sequências de emails
  - [ ] Delays
  - [ ] Condições (abriu, clicou, etc)
  - [ ] A/B testing

---

### Fase 4: Analytics e Reporting (2 semanas)

#### Semana 9: Dashboards
- [ ] Dashboard Home
  - [ ] Cards de métricas
  - [ ] Gráficos (Recharts)
  - [ ] Funil de vendas
  - [ ] Evolução temporal
  - [ ] Performance de equipe

- [ ] Widgets
  - [ ] Tarefas pendentes
  - [ ] Próximas ligações
  - [ ] Leads sem follow-up
  - [ ] Últimas atividades
  - [ ] Personalização (drag-drop)

#### Semana 10: Relatórios
- [ ] Relatórios Pré-definidos
  - [ ] Sales Pipeline Report
  - [ ] Lead Source Analysis
  - [ ] Conversion Rate by Stage
  - [ ] Activity Summary
  - [ ] Team Performance
  - [ ] Revenue Forecast

- [ ] Report Builder
  - [ ] Seleção de métricas
  - [ ] Filtros customizados
  - [ ] Agrupamento
  - [ ] Ordenação
  - [ ] Exportar PDF/Excel

---

### Fase 5: UX e Polimento (2 semanas)

#### Semana 11: Features Avançadas
- [ ] Command Palette (Cmd+K)
  - [ ] Busca global
  - [ ] Ações rápidas
  - [ ] Navegação

- [ ] Notificações
  - [ ] Supabase Realtime
  - [ ] Toast notifications (Sonner)
  - [ ] Badge de notificações não lidas

- [ ] Permissões (RBAC)
  - [ ] Middleware de autenticação
  - [ ] Verificação de role
  - [ ] Filtro de dados por permissão

#### Semana 12: UI/UX
- [ ] Mobile Responsive
  - [ ] Sidebar responsiva
  - [ ] Tabelas adaptativas
  - [ ] Forms mobile-friendly

- [ ] Dark Mode
  - [ ] Toggle
  - [ ] Persistência (localStorage)
  - [ ] Classes Tailwind

- [ ] Onboarding
  - [ ] Tour guiado (primeiro acesso)
  - [ ] Tooltips
  - [ ] Empty states

- [ ] Performance
  - [ ] React Query caching
  - [ ] Lazy loading
  - [ ] Code splitting
  - [ ] Image optimization

---

## 📦 Dependências a Instalar

```bash
# React Query
npm install @tanstack/react-query

# State Management
npm install zustand

# Forms
npm install react-hook-form zod @hookform/resolvers

# Charts
npm install recharts

# Utils
npm install date-fns clsx tailwind-merge

# UI
npm install sonner cmdk

# Integrations
npm install twilio @sendgrid/mail openai

# Rich Text Editor (para notas/emails)
npm install @tiptap/react @tiptap/starter-kit

# Drag and Drop
npm install @dnd-kit/core @dnd-kit/sortable
```

---

## 🎯 Status Atual

**Você está aqui:**
- ✅ Schema completo criado
- ✅ Migração de dados concluída (companies → leads)
- ✅ SQL para criar tabelas gerado
- ⏳ **Próximo:** Executar SQL no Supabase + criar admin + atualizar código

**Progresso geral:** ~25% do CRM completo

---

## 📝 Instruções para Continuar

### 1. Executar SQL no Supabase
```
1. Abra https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em SQL Editor
4. Copie todo o conteúdo de scripts/create-crm-tables.sql
5. Cole e execute (Run)
6. Verifique se aparece "CRM tables created successfully!"
```

### 2. Criar primeiro admin
```bash
npx tsx scripts/create-admin-user.ts
```

### 3. Atualizar código
Trocar todas as referências de `Company` para `Lead`:
- src/app/api/leads/
- src/app/dashboard/leads/
- src/components/leads/
- etc

### 4. Testar
```bash
npm run dev
# Acessar /dashboard/leads
# Verificar se tudo funciona
```

---

## 🚀 Após essa fase, podemos ir para:
- Oportunidades e Pipeline Kanban
- Ou Chamadas com Twilio
- Ou Email outreach

**Você decide a prioridade! 🎯**
