# 🚀 FrascoLife CRM - Roadmap de Implementação
## CRM Completo Estilo Salesforce

---

## 📋 Visão Geral

Este documento detalha o plano completo de implementação do FrascoLife CRM, um sistema de CRM completo inspirado na Salesforce, com todas as funcionalidades enterprise necessárias para gestão de vendas e relacionamento com clientes.

### Status Atual
- ✅ Autenticação e Autorização
- ✅ Dashboard Básico
- ✅ Lista de Leads (106.940 leads importados)
- ✅ Importação de dados CSV
- 🚧 Página de Detalhes do Lead (em desenvolvimento)

---

## 🎯 Objetivos do Projeto

Construir um CRM enterprise-grade com:
1. **Customização Total** - Campos e objetos personalizados
2. **Visão 360°** - Histórico completo de cada cliente
3. **Automação Inteligente** - Workflows e regras automáticas
4. **Pipeline Visual** - Kanban e gestão de oportunidades
5. **Relatórios Avançados** - Analytics e dashboards em tempo real
6. **Integrações** - Email, WhatsApp, Telefonia, Calendário
7. **Mobile First** - PWA completo e responsivo

---

## 📅 Fases de Implementação

---

## FASE 1: FUNDAÇÃO (2-3 semanas)
**Objetivo**: Criar a base sólida do CRM com visualização 360° e gestão de atividades

### 1.1 Página de Detalhes do Lead (360° View) ✅ EM ANDAMENTO
**Tempo estimado**: 3-4 dias

#### Features:
- [x] API route para buscar lead com relacionamentos
- [x] Layout estilo Salesforce
- [ ] Header com informações principais
- [ ] Badges de status e estágio
- [ ] Quick Actions (Call, Email, WhatsApp, Schedule, Task)
- [ ] Tabs navegáveis (Detalhes, Atividades, Tarefas, Oportunidades)
- [ ] Sidebar com informações complementares
- [ ] Métricas principais (Score, Probabilidade, Atividades, Tarefas)

#### Componentes:
- `src/app/dashboard/leads/[id]/page.tsx`
- `src/app/api/leads/[id]/route.ts`

---

### 1.2 Activity Timeline & Quick Actions
**Tempo estimado**: 4-5 dias

#### Features:
- [ ] Timeline unificada de todas as interações
- [ ] Filtros por tipo de atividade
- [ ] Ordenação cronológica
- [ ] Modal para registrar ligação (Call)
- [ ] Modal para enviar email
- [ ] Modal para WhatsApp
- [ ] Modal para criar nota
- [ ] Modal para criar tarefa
- [ ] Modal para agendar reunião

#### Componentes:
- `src/components/leads/ActivityTimeline.tsx`
- `src/components/leads/modals/CallModal.tsx`
- `src/components/leads/modals/EmailModal.tsx`
- `src/components/leads/modals/WhatsAppModal.tsx`
- `src/components/leads/modals/NoteModal.tsx`
- `src/components/leads/modals/TaskModal.tsx`

---

### 1.3 API Routes para Atividades
**Tempo estimado**: 3 dias

#### Endpoints a criar:
- [ ] `POST /api/activities` - Registrar atividade genérica
- [ ] `POST /api/calls` - Registrar ligação
- [ ] `POST /api/emails` - Registrar/enviar email
- [ ] `POST /api/whatsapp` - Registrar mensagem WhatsApp
- [ ] `POST /api/notes` - Criar nota
- [ ] `POST /api/tasks` - Criar tarefa
- [ ] `GET /api/leads/[id]/timeline` - Buscar timeline completa

#### Arquivos:
- `src/app/api/activities/route.ts`
- `src/app/api/calls/route.ts`
- `src/app/api/emails/route.ts`
- `src/app/api/whatsapp/route.ts`
- `src/app/api/notes/route.ts`
- `src/app/api/tasks/route.ts`

---

## FASE 2: PIPELINE & GESTÃO (2 semanas)
**Objetivo**: Implementar Kanban Board e sistema de atribuição de leads

### 2.1 Kanban Board com Drag & Drop
**Tempo estimado**: 5-6 dias

#### Features:
- [ ] Board com colunas por estágio (NEW → WON/LOST)
- [ ] Drag & Drop entre estágios
- [ ] Contadores por coluna
- [ ] Filtros (Responsável, Região, CNAE, Score)
- [ ] Busca rápida
- [ ] Card do lead com informações resumidas
- [ ] Modal de detalhes rápidos (Quick View)
- [ ] Ações em lote (Atribuir múltiplos, Mudar estágio)

#### Tecnologias:
- `@dnd-kit/core` para drag & drop
- `@dnd-kit/sortable`

#### Componentes:
- `src/app/dashboard/pipeline/page.tsx`
- `src/components/pipeline/KanbanBoard.tsx`
- `src/components/pipeline/KanbanColumn.tsx`
- `src/components/pipeline/LeadCard.tsx`
- `src/components/pipeline/QuickViewModal.tsx`

#### API:
- `PATCH /api/leads/[id]/stage` - Mudar estágio do lead

---

### 2.2 Lead Assignment & Distribuição
**Tempo estimado**: 4-5 dias

#### Features:
- [ ] Modal de atribuição de lead
- [ ] Seleção de vendedor/responsável
- [ ] Atribuição manual individual
- [ ] Atribuição em lote
- [ ] Regras de distribuição automática:
  - Round-robin (circular)
  - Por território (UF/Região)
  - Por CNAE
  - Por carga de trabalho
- [ ] Histórico de atribuições
- [ ] Notificações ao vendedor atribuído

#### Componentes:
- `src/components/leads/AssignModal.tsx`
- `src/components/leads/AssignmentRules.tsx`
- `src/app/dashboard/settings/assignment-rules/page.tsx`

#### API:
- `PATCH /api/leads/[id]/assign` - Atribuir lead
- `POST /api/leads/bulk-assign` - Atribuição em lote
- `GET /api/assignment-rules` - Buscar regras
- `POST /api/assignment-rules` - Criar regra

---

## FASE 3: AUTOMAÇÃO INTELIGENTE (3 semanas)
**Objetivo**: Implementar workflows, scoring e templates

### 3.1 Workflow Engine & Rules
**Tempo estimado**: 7-8 dias

#### Features:
- [ ] Interface de criação de workflows
- [ ] Trigger conditions (Quando)
  - Lead criado
  - Campo alterado
  - Estágio mudou
  - Tempo decorrido (X dias sem atividade)
- [ ] Actions (Então)
  - Enviar email
  - Criar tarefa
  - Atribuir para vendedor
  - Mudar estágio
  - Adicionar tag
  - Atualizar campo
  - Enviar notificação
- [ ] Visual workflow builder (no-code)
- [ ] Testes de workflow
- [ ] Logs e histórico de execução

#### Componentes:
- `src/app/dashboard/automation/workflows/page.tsx`
- `src/components/automation/WorkflowBuilder.tsx`
- `src/components/automation/TriggerSelector.tsx`
- `src/components/automation/ActionSelector.tsx`

#### Backend:
- `src/lib/automation/workflow-engine.ts`
- `src/lib/automation/triggers.ts`
- `src/lib/automation/actions.ts`

#### API:
- `GET /api/workflows` - Listar workflows
- `POST /api/workflows` - Criar workflow
- `PATCH /api/workflows/[id]` - Editar workflow
- `POST /api/workflows/[id]/test` - Testar workflow

---

### 3.2 Lead Scoring Automático
**Tempo estimado**: 4-5 dias

#### Features:
- [ ] Sistema de pontuação configurável
- [ ] Critérios de pontuação:
  - Perfil da empresa (porte, CNAE, região)
  - Comportamento (visitas, aberturas de email, cliques)
  - Engajamento (ligações atendidas, emails respondidos)
  - Tempo no pipeline
- [ ] Decaimento de score (leads frios)
- [ ] Hot leads (score > 80)
- [ ] Interface de configuração de scoring
- [ ] Re-cálculo automático
- [ ] Histórico de score

#### Componentes:
- `src/app/dashboard/settings/lead-scoring/page.tsx`
- `src/components/settings/ScoringRules.tsx`

#### Backend:
- `src/lib/scoring/score-calculator.ts`
- `src/lib/scoring/score-rules.ts`

#### API:
- `GET /api/scoring/rules` - Buscar regras de scoring
- `POST /api/scoring/rules` - Criar/atualizar regras
- `POST /api/scoring/recalculate` - Recalcular scores

---

### 3.3 Email Templates & Envio
**Tempo estimado**: 5 dias

#### Features:
- [ ] Biblioteca de templates de email
- [ ] Editor de templates (WYSIWYG)
- [ ] Variáveis dinâmicas ({{lead.name}}, {{company.name}})
- [ ] Preview de email
- [ ] Envio individual
- [ ] Envio em massa
- [ ] Rastreamento de abertura
- [ ] Rastreamento de cliques
- [ ] Respostas automáticas
- [ ] Agendamento de envio

#### Componentes:
- `src/app/dashboard/email/templates/page.tsx`
- `src/components/email/TemplateEditor.tsx`
- `src/components/email/TemplateLibrary.tsx`
- `src/components/email/SendEmailModal.tsx`

#### Backend:
- Integração com serviço de email (SendGrid/AWS SES)
- `src/lib/email/email-sender.ts`
- `src/lib/email/template-engine.ts`

#### API:
- `GET /api/email/templates` - Listar templates
- `POST /api/email/templates` - Criar template
- `POST /api/email/send` - Enviar email
- `POST /api/email/bulk-send` - Envio em massa
- `GET /api/email/tracking/[id]` - Estatísticas de email

---

## FASE 4: RELATÓRIOS & ANALYTICS (2 semanas)
**Objetivo**: Dashboards, métricas e relatórios customizados

### 4.1 Dashboard com Métricas em Tempo Real
**Tempo estimado**: 6-7 dias

#### Features:
- [ ] Dashboard principal renovado
- [ ] Cards de KPIs principais:
  - Total de leads
  - Taxa de conversão
  - Tempo médio no pipeline
  - Receita prevista
  - Win rate
- [ ] Gráficos interativos:
  - Funil de conversão
  - Leads por estágio (bar chart)
  - Evolução temporal (line chart)
  - Distribuição geográfica (mapa)
  - Top CNAEs (pie chart)
- [ ] Filtros de período (hoje, semana, mês, trimestre, ano, custom)
- [ ] Comparação com período anterior
- [ ] Drill-down (clicar no gráfico para ver detalhes)

#### Tecnologias:
- `recharts` ou `chart.js` para gráficos
- `react-map-gl` para mapas

#### Componentes:
- `src/app/dashboard/page.tsx` (atualização)
- `src/components/dashboard/KPICard.tsx`
- `src/components/dashboard/FunnelChart.tsx`
- `src/components/dashboard/TimelineChart.tsx`
- `src/components/dashboard/GeographicMap.tsx`

#### API:
- `GET /api/analytics/kpis` - KPIs principais
- `GET /api/analytics/funnel` - Dados do funil
- `GET /api/analytics/timeline` - Evolução temporal
- `GET /api/analytics/geographic` - Distribuição geográfica

---

### 4.2 Report Builder & Funil de Vendas
**Tempo estimado**: 5-6 dias

#### Features:
- [ ] Report builder (arrastar campos)
- [ ] Tipos de relatório:
  - Tabular
  - Sumário
  - Matriz
- [ ] Agrupamentos customizados
- [ ] Cálculos (sum, avg, min, max, count)
- [ ] Filtros avançados
- [ ] Ordenação
- [ ] Export (Excel, CSV, PDF)
- [ ] Agendamento de relatórios
- [ ] Compartilhamento de relatórios
- [ ] Relatórios salvos/favoritos

#### Componentes:
- `src/app/dashboard/reports/page.tsx`
- `src/components/reports/ReportBuilder.tsx`
- `src/components/reports/FieldSelector.tsx`
- `src/components/reports/FilterBuilder.tsx`
- `src/components/reports/ReportViewer.tsx`

#### API:
- `POST /api/reports/build` - Gerar relatório
- `GET /api/reports` - Listar relatórios salvos
- `POST /api/reports/save` - Salvar relatório
- `GET /api/reports/[id]/export` - Exportar relatório

---

## FASE 5: INTEGRAÇÕES (3 semanas)
**Objetivo**: Conectar com serviços externos

### 5.1 Email (Gmail/Outlook) & Calendário
**Tempo estimado**: 7-8 dias

#### Features:
- [ ] OAuth com Gmail
- [ ] OAuth com Outlook/Microsoft
- [ ] Sync bidirecional de emails
- [ ] Sidebar de email no lead
- [ ] Enviar email pelo CRM
- [ ] Responder emails
- [ ] Anexar emails ao lead
- [ ] Sync de calendário
- [ ] Criar eventos no calendário
- [ ] Ver disponibilidade
- [ ] Lembretes automáticos

#### Tecnologias:
- Google Calendar API
- Gmail API
- Microsoft Graph API

#### Componentes:
- `src/app/dashboard/settings/integrations/email/page.tsx`
- `src/components/integrations/GmailConnect.tsx`
- `src/components/integrations/OutlookConnect.tsx`
- `src/components/leads/EmailSidebar.tsx`

#### Backend:
- `src/lib/integrations/gmail.ts`
- `src/lib/integrations/outlook.ts`
- `src/lib/integrations/calendar.ts`

#### API:
- `POST /api/integrations/gmail/auth` - Autenticar Gmail
- `POST /api/integrations/outlook/auth` - Autenticar Outlook
- `GET /api/integrations/emails/sync` - Sincronizar emails
- `POST /api/integrations/calendar/event` - Criar evento

---

### 5.2 WhatsApp & SMS
**Tempo estimado**: 6-7 dias

#### Features:
- [ ] Integração com WhatsApp Business API
- [ ] Envio de mensagens WhatsApp
- [ ] Recebimento de mensagens
- [ ] Templates de mensagem WhatsApp
- [ ] Integração com Twilio (SMS)
- [ ] Envio de SMS
- [ ] Campanhas de WhatsApp/SMS
- [ ] Chatbot básico
- [ ] Respostas automáticas
- [ ] Histórico de conversas

#### Tecnologias:
- WhatsApp Business API
- Twilio API

#### Componentes:
- `src/app/dashboard/whatsapp/page.tsx`
- `src/components/whatsapp/ChatInterface.tsx`
- `src/components/whatsapp/MessageComposer.tsx`
- `src/components/whatsapp/TemplateSelector.tsx`

#### Backend:
- `src/lib/integrations/whatsapp.ts`
- `src/lib/integrations/twilio.ts`

#### API:
- `POST /api/whatsapp/send` - Enviar mensagem
- `GET /api/whatsapp/conversations` - Listar conversas
- `POST /api/sms/send` - Enviar SMS
- `POST /api/whatsapp/webhook` - Webhook para receber mensagens

---

### 5.3 Telefonia (CTI)
**Tempo estimado**: 4-5 dias

#### Features:
- [ ] Integração com Twilio Voice
- [ ] Click-to-call
- [ ] Softphone no browser
- [ ] Gravação de chamadas
- [ ] Transferência de chamadas
- [ ] Conferência
- [ ] IVR básico
- [ ] Call center dashboard
- [ ] Fila de atendimento

#### Tecnologias:
- Twilio Voice API
- WebRTC

#### Componentes:
- `src/components/phone/Softphone.tsx`
- `src/components/phone/CallControls.tsx`
- `src/app/dashboard/call-center/page.tsx`

#### Backend:
- `src/lib/integrations/twilio-voice.ts`

#### API:
- `POST /api/calls/dial` - Fazer ligação
- `POST /api/calls/record` - Iniciar gravação
- `POST /api/calls/transfer` - Transferir chamada

---

## FASE 6: CUSTOMIZAÇÃO AVANÇADA (2 semanas)
**Objetivo**: Permitir customização total do CRM

### 6.1 Custom Fields Builder
**Tempo estimado**: 5-6 dias

#### Features:
- [ ] Interface para criar campos personalizados
- [ ] Tipos de campo:
  - Text (curto/longo)
  - Number
  - Decimal
  - Date/DateTime
  - Boolean (checkbox)
  - Picklist (dropdown)
  - Multi-select
  - URL
  - Email
  - Phone
  - Currency
- [ ] Validações de campo
- [ ] Campos obrigatórios
- [ ] Valores padrão
- [ ] Fórmulas (campo calculado)
- [ ] Dependências entre campos
- [ ] Aplicar campos a objetos (Lead, Opportunity, Contact)

#### Componentes:
- `src/app/dashboard/settings/custom-fields/page.tsx`
- `src/components/settings/FieldBuilder.tsx`
- `src/components/settings/FieldTypeSelector.tsx`

#### Backend:
- Schema dinâmico (JSONB no PostgreSQL)
- `src/lib/custom-fields/field-manager.ts`

#### API:
- `GET /api/custom-fields` - Listar campos customizados
- `POST /api/custom-fields` - Criar campo
- `PATCH /api/custom-fields/[id]` - Editar campo
- `DELETE /api/custom-fields/[id]` - Deletar campo

---

### 6.2 Custom Objects Builder
**Tempo estimado**: 6-7 dias

#### Features:
- [ ] Interface para criar objetos personalizados
- [ ] Definir nome e label do objeto
- [ ] Adicionar campos ao objeto
- [ ] Relacionamentos entre objetos (1:1, 1:N, N:N)
- [ ] Tabs customizadas
- [ ] Page layouts personalizados
- [ ] Permissões por objeto
- [ ] API REST automática para objetos customizados

#### Componentes:
- `src/app/dashboard/settings/custom-objects/page.tsx`
- `src/components/settings/ObjectBuilder.tsx`
- `src/components/settings/RelationshipBuilder.tsx`

#### Backend:
- `src/lib/custom-objects/object-manager.ts`
- Geração dinâmica de APIs

#### API:
- `GET /api/custom-objects` - Listar objetos
- `POST /api/custom-objects` - Criar objeto
- `GET /api/custom-objects/[name]` - CRUD automático do objeto

---

## FASE 7: MOBILE & PWA (1-2 semanas)
**Objetivo**: Aplicativo mobile completo

### 7.1 PWA (Progressive Web App)
**Tempo estimado**: 4-5 dias

#### Features:
- [ ] Manifest.json configurado
- [ ] Service Worker
- [ ] Offline mode
- [ ] Cache de dados
- [ ] Install prompt
- [ ] Push notifications
- [ ] App icon
- [ ] Splash screen

#### Arquivos:
- `public/manifest.json`
- `public/service-worker.js`
- `next.config.js` (configuração PWA)

---

### 7.2 Mobile UI Responsivo
**Tempo estimado**: 5-6 dias

#### Features:
- [ ] Layout mobile-first
- [ ] Navigation drawer
- [ ] Bottom navigation
- [ ] Swipe gestures
- [ ] Mobile-optimized tables
- [ ] Touch-friendly buttons
- [ ] Camera access (scan CNPJ, business cards)
- [ ] Geolocalização (check-in)
- [ ] Modo offline robusto

---

## 🎯 Métricas de Sucesso

### Performance
- [ ] Time to Interactive < 3s
- [ ] Lighthouse Score > 90
- [ ] Core Web Vitals: Good

### Adoção
- [ ] 100% dos vendedores usando diariamente
- [ ] Média de 10+ atividades registradas por dia
- [ ] 80% de leads atribuídos em 24h

### Negócio
- [ ] Redução de 30% no tempo médio de fechamento
- [ ] Aumento de 25% na taxa de conversão
- [ ] ROI positivo em 6 meses

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: Shadcn/UI + Tailwind CSS
- **State**: React Query + Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit
- **Rich Text**: Tiptap

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Auth**: NextAuth.js
- **File Storage**: Supabase Storage

### Integrações
- **Email**: SendGrid / AWS SES
- **WhatsApp**: WhatsApp Business API
- **SMS/Voice**: Twilio
- **Calendar**: Google Calendar API, Microsoft Graph
- **Payment**: Stripe (para billing)

### DevOps
- **Hosting**: Vercel
- **Database**: Supabase
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry
- **Analytics**: PostHog

---

## 📦 Entregáveis por Fase

### Fase 1 - Fundação
- ✅ Página de detalhes do lead completa
- ✅ Activity timeline funcional
- ✅ Modals de quick actions
- ✅ APIs de atividades

### Fase 2 - Pipeline
- ✅ Kanban board drag & drop
- ✅ Sistema de atribuição
- ✅ Regras de distribuição automática

### Fase 3 - Automação
- ✅ Workflow engine completo
- ✅ Lead scoring automático
- ✅ Templates de email
- ✅ Envio de emails em massa

### Fase 4 - Relatórios
- ✅ Dashboard renovado
- ✅ Report builder
- ✅ Exports (Excel, PDF)

### Fase 5 - Integrações
- ✅ Gmail/Outlook integrado
- ✅ WhatsApp/SMS funcional
- ✅ Telefonia CTI

### Fase 6 - Customização
- ✅ Custom fields
- ✅ Custom objects
- ✅ Page layouts

### Fase 7 - Mobile
- ✅ PWA instalável
- ✅ UI mobile completa
- ✅ Offline mode

---

## 🚀 Próximos Passos Imediatos

1. **Concluir Página de Detalhes** (em andamento)
2. **Implementar Activity Timeline**
3. **Criar Quick Action Modals**
4. **Desenvolver APIs de atividades**
5. **Iniciar Kanban Board**

---

## 📞 Contato & Suporte

Para questões sobre o roadmap:
- **Projeto**: FrascoLife CRM
- **Versão**: 1.0.0
- **Última atualização**: Janeiro 2026

---

> **Nota**: Este roadmap é um documento vivo e será atualizado conforme o progresso do projeto e mudanças nos requisitos.
