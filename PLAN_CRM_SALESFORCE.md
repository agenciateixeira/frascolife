# FrascoLife CRM - Plano Completo Estilo Salesforce

## 🎯 Visão Geral

CRM completo para gestão de leads B2B com foco em cold calling, WhatsApp outreach, email marketing e automação de vendas.

---

## 📊 Stack Tecnológica

### **Frontend**
- **Next.js 14** (App Router) - Framework React com SSR/SSG
- **TypeScript** - Tipagem estática
- **Tailwind CSS v3** - Estilização
- **Shadcn/ui** - Componentes UI (Button, Input, Dialog, Dropdown, etc)
- **Lucide React** - Ícones
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **TanStack Query (React Query)** - Cache e state management de dados server
- **Zustand** - State management global (UI states)
- **Recharts** - Gráficos e dashboards

### **Backend**
- **Next.js API Routes** - Endpoints REST
- **Prisma ORM** - Database toolkit
- **PostgreSQL (Supabase)** - Database principal
- **Supabase Auth** - Autenticação
- **Supabase Storage** - Arquivos (gravações, anexos)
- **Supabase Realtime** - WebSockets para updates em tempo real

### **Integrações**
- **Twilio Voice API** - Ligações telefônicas
- **Twilio WhatsApp API** - Mensagens WhatsApp
- **SendGrid / Resend** - Email transacional e marketing
- **OpenAI API** - IA para transcrições, resumos, análise de sentimento
- **Whisper API** - Transcrição de áudio
- **BrasilAPI** - Enriquecimento de dados CNPJ (já implementado)

### **Ferramentas**
- **Zod** - Validação de dados
- **date-fns** - Manipulação de datas
- **clsx / tailwind-merge** - Utility classes
- **Sonner** - Toast notifications
- **cmdk** - Command palette (busca rápida estilo Cmd+K)

---

## 🗄️ Arquitetura do Banco de Dados

### **Schema Prisma Completo**

```prisma
// ============================================
// MÓDULO: USUÁRIOS E PERMISSÕES
// ============================================

model User {
  id            String    @id @default(cuid())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Dados básicos (Supabase Auth)
  supabaseId    String    @unique
  email         String    @unique
  fullName      String?
  avatar        String?
  phone         String?

  // Permissões e Acesso
  role          UserRole  @default(SALES_REP)
  teamId        String?
  team          Team?     @relation(fields: [teamId], references: [id])
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?

  // Relacionamentos
  assignedLeads     Lead[]
  activities        Activity[]
  calls             Call[]
  emails            Email[]
  whatsappMessages  WhatsAppMessage[]
  tasks             Task[]
  notes             Note[]
  campaigns         Campaign[]

  @@index([supabaseId])
  @@index([teamId])
  @@index([role])
  @@map("users")
}

enum UserRole {
  ADMIN           // Acesso total
  MANAGER         // Gerente de equipe
  SALES_REP       // Vendedor
  SDR             // Sales Development Rep (prospecção)
  VIEWER          // Apenas visualização
}

model Team {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  name        String
  description String?
  color       String?  // Para UI

  members     User[]
  campaigns   Campaign[]

  @@map("teams")
}

// ============================================
// MÓDULO: LEADS E CONTAS
// ============================================

model Lead {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Dados da Empresa (já existentes)
  cnpj              String   @unique
  razaoSocial       String?
  nomeFantasia      String?
  situacaoCadastral String
  cnaePrincipal     String?
  cnaesSecundarios  String?  @map("cnaes_secundarios")
  porte             String?
  naturezaJuridica  String?  @map("natureza_juridica")
  capitalSocial     String?  @map("capital_social")
  dataAbertura      String?
  dataSituacaoCadastral String? @map("data_situacao_cadastral")

  // Endereço
  logradouro    String?
  numero        String?
  complemento   String?
  bairro        String?
  cep           String?
  municipio     String?
  uf            String?
  matrizFilial  String

  // Contato
  ddd1          String?
  telefone1     String?
  ddd2          String?
  telefone2     String?
  email         String?

  // CRM Fields (NOVOS)
  stage         LeadStage    @default(NEW)
  score         Int          @default(0)        // Lead scoring (0-100)
  source        LeadSource   @default(MANUAL)   // Origem do lead

  // Relacionamento com vendedor
  assignedToId  String?
  assignedTo    User?        @relation(fields: [assignedToId], references: [id])
  assignedAt    DateTime?

  // Contato Principal (Pessoa física)
  contactName       String?
  contactRole       String?  // Cargo
  contactPhone      String?
  contactEmail      String?
  contactLinkedIn   String?

  // Qualificação
  isQualified       Boolean   @default(false)
  qualifiedAt       DateTime?
  disqualifiedReason String?

  // Estimativas
  estimatedRevenue  Decimal?  @db.Decimal(12, 2)
  estimatedCloseDate DateTime?
  probability       Int?      // 0-100%

  // Relacionamentos
  activities    Activity[]
  calls         Call[]
  emails        Email[]
  whatsappMessages WhatsAppMessage[]
  tasks         Task[]
  notes         Note[]
  tags          LeadTag[]
  opportunities Opportunity[]
  campaignLeads CampaignLead[]

  @@index([stage])
  @@index([assignedToId])
  @@index([score])
  @@index([uf])
  @@index([cnaePrincipal])
  @@index([situacaoCadastral])
  @@map("leads")
}

enum LeadStage {
  NEW              // Novo lead
  CONTACTED        // Já foi contatado
  QUALIFIED        // Qualificado (tem interesse)
  PROPOSAL         // Proposta enviada
  NEGOTIATION      // Em negociação
  WON              // Ganho (virou cliente)
  LOST             // Perdido
  NURTURING        // Nutrição (não agora, mas futuro)
}

enum LeadSource {
  MANUAL           // Adicionado manualmente
  IMPORT           // Importação CSV
  API              // Via API
  WEBSITE          // Site/Landing page
  REFERRAL         // Indicação
  COLD_CALL        // Cold calling
  EVENT            // Evento/Feira
  SOCIAL_MEDIA     // Redes sociais
}

// ============================================
// MÓDULO: PIPELINE E OPORTUNIDADES
// ============================================

model Opportunity {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  name        String
  description String?  @db.Text

  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  stage       OpportunityStage @default(PROSPECTING)
  probability Int      @default(10)  // Probabilidade de fechar (%)

  value       Decimal  @db.Decimal(12, 2)
  expectedCloseDate DateTime?
  closedAt    DateTime?
  wonReason   String?  @db.Text
  lostReason  String?  @db.Text

  assignedToId String?
  assignedTo   User?   @relation(fields: [assignedToId], references: [id])

  products    OpportunityProduct[]
  activities  Activity[]

  @@index([leadId])
  @@index([stage])
  @@index([assignedToId])
  @@map("opportunities")
}

enum OpportunityStage {
  PROSPECTING      // Prospecção
  QUALIFICATION    // Qualificação
  NEEDS_ANALYSIS   // Análise de necessidades
  VALUE_PROPOSITION // Proposta de valor
  DECISION_MAKERS  // Identificação de tomadores de decisão
  PROPOSAL         // Proposta enviada
  NEGOTIATION      // Negociação
  CLOSED_WON       // Ganho
  CLOSED_LOST      // Perdido
}

model Product {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  name        String
  description String?  @db.Text
  sku         String?  @unique
  price       Decimal  @db.Decimal(12, 2)
  isActive    Boolean  @default(true)

  opportunities OpportunityProduct[]

  @@map("products")
}

model OpportunityProduct {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())

  opportunityId String
  opportunity   Opportunity @relation(fields: [opportunityId], references: [id], onDelete: Cascade)

  productId     String
  product       Product  @relation(fields: [productId], references: [id])

  quantity      Int      @default(1)
  unitPrice     Decimal  @db.Decimal(12, 2)
  discount      Decimal  @default(0) @db.Decimal(5, 2) // Percentual
  total         Decimal  @db.Decimal(12, 2)

  @@unique([opportunityId, productId])
  @@map("opportunity_products")
}

// ============================================
// MÓDULO: ATIVIDADES E TIMELINE
// ============================================

model Activity {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())

  type        ActivityType
  title       String
  description String?  @db.Text

  leadId      String?
  lead        Lead?    @relation(fields: [leadId], references: [id], onDelete: Cascade)

  opportunityId String?
  opportunity   Opportunity? @relation(fields: [opportunityId], references: [id], onDelete: Cascade)

  userId      String
  user        User     @relation(fields: [userId], references: [id])

  // Metadata específica por tipo
  metadata    Json?    // Campos extras flexíveis

  @@index([leadId])
  @@index([opportunityId])
  @@index([userId])
  @@index([type])
  @@index([createdAt])
  @@map("activities")
}

enum ActivityType {
  CALL             // Ligação
  EMAIL            // Email
  WHATSAPP         // WhatsApp
  MEETING          // Reunião
  NOTE             // Nota/Observação
  TASK_COMPLETED   // Tarefa concluída
  STAGE_CHANGED    // Mudança de estágio
  ASSIGNED         // Lead atribuído
  STATUS_CHANGED   // Status alterado
}

// ============================================
// MÓDULO: COMUNICAÇÃO - CHAMADAS
// ============================================

model Call {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  userId      String
  user        User     @relation(fields: [userId], references: [id])

  // Dados da chamada
  direction   CallDirection
  status      CallStatus
  duration    Int?     // Segundos
  startedAt   DateTime?
  endedAt     DateTime?

  // Twilio
  twilioCallSid String? @unique
  fromNumber    String
  toNumber      String

  // Gravação
  recordingUrl  String?
  recordingSid  String?

  // IA
  transcription String?  @db.Text
  summary       String?  @db.Text
  sentiment     Sentiment?
  keywords      String[] // Array de palavras-chave extraídas

  // Notas manuais
  notes         String?  @db.Text
  outcome       CallOutcome?

  @@index([leadId])
  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("calls")
}

enum CallDirection {
  INBOUND
  OUTBOUND
}

enum CallStatus {
  INITIATED    // Iniciada
  RINGING      // Tocando
  IN_PROGRESS  // Em andamento
  COMPLETED    // Completada
  FAILED       // Falhou
  BUSY         // Ocupado
  NO_ANSWER    // Não atendeu
  CANCELED     // Cancelada
}

enum CallOutcome {
  INTERESTED       // Interessado
  NOT_INTERESTED   // Não interessado
  CALLBACK         // Retornar ligação
  WRONG_NUMBER     // Número errado
  VOICEMAIL        // Caixa postal
  MEETING_SCHEDULED // Reunião agendada
}

enum Sentiment {
  POSITIVE
  NEUTRAL
  NEGATIVE
}

// ============================================
// MÓDULO: COMUNICAÇÃO - EMAIL
// ============================================

model Email {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  userId      String
  user        User     @relation(fields: [userId], references: [id])

  // Dados do email
  direction   EmailDirection
  subject     String
  body        String   @db.Text
  htmlBody    String?  @db.Text

  fromEmail   String
  toEmail     String
  ccEmails    String[]
  bccEmails   String[]

  // Status
  status      EmailStatus @default(DRAFT)
  sentAt      DateTime?
  deliveredAt DateTime?
  openedAt    DateTime?
  clickedAt   DateTime?
  bouncedAt   DateTime?

  // Tracking
  opens       Int      @default(0)
  clicks      Int      @default(0)

  // Provider
  messageId   String?  @unique  // SendGrid/Resend ID
  templateId  String?

  // Anexos
  attachments EmailAttachment[]

  @@index([leadId])
  @@index([userId])
  @@index([status])
  @@index([sentAt])
  @@map("emails")
}

enum EmailDirection {
  INBOUND
  OUTBOUND
}

enum EmailStatus {
  DRAFT
  SCHEDULED
  SENT
  DELIVERED
  OPENED
  CLICKED
  BOUNCED
  FAILED
}

model EmailAttachment {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())

  emailId     String
  email       Email    @relation(fields: [emailId], references: [id], onDelete: Cascade)

  filename    String
  filesize    Int      // bytes
  contentType String
  url         String   // Supabase Storage URL

  @@index([emailId])
  @@map("email_attachments")
}

model EmailTemplate {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  name        String
  subject     String
  body        String   @db.Text
  htmlBody    String?  @db.Text

  category    String?
  isActive    Boolean  @default(true)

  // Variables disponíveis: {{leadName}}, {{companyName}}, etc
  variables   String[] // Lista de variáveis usadas no template

  @@map("email_templates")
}

// ============================================
// MÓDULO: COMUNICAÇÃO - WHATSAPP
// ============================================

model WhatsAppMessage {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  userId      String?
  user        User?    @relation(fields: [userId], references: [id])

  // Dados da mensagem
  direction   MessageDirection
  content     String   @db.Text
  contentType MessageContentType @default(TEXT)

  // Números
  fromNumber  String
  toNumber    String

  // Status
  status      MessageStatus @default(PENDING)
  sentAt      DateTime?
  deliveredAt DateTime?
  readAt      DateTime?
  failedAt    DateTime?

  // Twilio
  twilioMessageSid String? @unique
  errorMessage     String?

  // Media
  mediaUrl    String?

  @@index([leadId])
  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("whatsapp_messages")
}

enum MessageDirection {
  INBOUND
  OUTBOUND
}

enum MessageContentType {
  TEXT
  IMAGE
  DOCUMENT
  AUDIO
  VIDEO
}

enum MessageStatus {
  PENDING
  SENT
  DELIVERED
  READ
  FAILED
}

model WhatsAppTemplate {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  name        String
  content     String   @db.Text
  category    String?
  isActive    Boolean  @default(true)

  // Twilio Template ID
  twilioSid   String?  @unique

  @@map("whatsapp_templates")
}

// ============================================
// MÓDULO: TAREFAS E FOLLOW-UPS
// ============================================

model Task {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  title       String
  description String?  @db.Text

  leadId      String?
  lead        Lead?    @relation(fields: [leadId], references: [id], onDelete: Cascade)

  assignedToId String
  assignedTo   User    @relation(fields: [assignedToId], references: [id])

  // Agendamento
  dueDate     DateTime
  priority    TaskPriority @default(MEDIUM)
  status      TaskStatus   @default(TODO)

  // Conclusão
  completedAt DateTime?
  completedBy String?

  // Relacionamentos
  reminders   TaskReminder[]

  @@index([leadId])
  @@index([assignedToId])
  @@index([status])
  @@index([dueDate])
  @@map("tasks")
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETED
  CANCELED
}

model TaskReminder {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())

  taskId      String
  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)

  remindAt    DateTime
  method      ReminderMethod @default(EMAIL)
  sent        Boolean  @default(false)
  sentAt      DateTime?

  @@index([taskId])
  @@index([remindAt])
  @@map("task_reminders")
}

enum ReminderMethod {
  EMAIL
  NOTIFICATION
  WHATSAPP
}

// ============================================
// MÓDULO: NOTAS
// ============================================

model Note {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  content     String   @db.Text

  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id])

  isPinned    Boolean  @default(false)

  @@index([leadId])
  @@index([createdById])
  @@index([createdAt])
  @@map("notes")
}

// ============================================
// MÓDULO: TAGS E SEGMENTAÇÃO
// ============================================

model Tag {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())

  name        String   @unique
  color       String   // Hex color
  icon        String?

  leads       LeadTag[]

  @@map("tags")
}

model LeadTag {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())

  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  tagId       String
  tag         Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([leadId, tagId])
  @@index([leadId])
  @@index([tagId])
  @@map("lead_tags")
}

// ============================================
// MÓDULO: CAMPANHAS
// ============================================

model Campaign {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  name        String
  description String?  @db.Text

  type        CampaignType
  status      CampaignStatus @default(DRAFT)

  // Datas
  startDate   DateTime?
  endDate     DateTime?

  // Responsável
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])

  teamId      String?
  team        Team?    @relation(fields: [teamId], references: [id])

  // Filtros aplicados
  filters     Json?    // Critérios de segmentação

  // Estatísticas
  totalLeads      Int @default(0)
  contactedLeads  Int @default(0)
  qualifiedLeads  Int @default(0)
  wonLeads        Int @default(0)

  // Relacionamentos
  leads       CampaignLead[]

  @@index([ownerId])
  @@index([teamId])
  @@index([status])
  @@map("campaigns")
}

enum CampaignType {
  COLD_CALL
  EMAIL
  WHATSAPP
  MULTI_CHANNEL
}

enum CampaignStatus {
  DRAFT
  SCHEDULED
  ACTIVE
  PAUSED
  COMPLETED
  CANCELED
}

model CampaignLead {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  campaignId  String
  campaign    Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  leadId      String
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)

  status      CampaignLeadStatus @default(PENDING)
  priority    Int      @default(0)

  contactedAt DateTime?
  respondedAt DateTime?
  outcome     String?

  @@unique([campaignId, leadId])
  @@index([campaignId])
  @@index([leadId])
  @@index([status])
  @@map("campaign_leads")
}

enum CampaignLeadStatus {
  PENDING
  CONTACTED
  RESPONDED
  QUALIFIED
  CONVERTED
  SKIPPED
}

// ============================================
// MÓDULO: RELATÓRIOS E ANALYTICS
// ============================================

model Report {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  name        String
  description String?  @db.Text
  type        ReportType

  // Filtros e configuração
  config      Json

  // Compartilhamento
  isPublic    Boolean  @default(false)
  createdById String

  @@map("reports")
}

enum ReportType {
  SALES_PIPELINE
  LEAD_SOURCE
  CONVERSION_RATE
  ACTIVITY_SUMMARY
  TEAM_PERFORMANCE
  REVENUE_FORECAST
}

// ============================================
// MÓDULO: AUTOMAÇÕES
// ============================================

model Automation {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  name        String
  description String?  @db.Text
  isActive    Boolean  @default(true)

  // Trigger (quando executar)
  trigger     AutomationTrigger
  triggerConfig Json

  // Actions (o que fazer)
  actions     Json     // Array de ações

  // Estatísticas
  executionCount Int   @default(0)
  lastExecutedAt DateTime?

  @@map("automations")
}

enum AutomationTrigger {
  LEAD_CREATED
  LEAD_STAGE_CHANGED
  LEAD_ASSIGNED
  TASK_DUE
  EMAIL_OPENED
  CALL_COMPLETED
  INACTIVITY_PERIOD
}
```

---

## 🎨 Estrutura de Páginas e Rotas

### **Navegação Principal**

```
/dashboard
  ├── /leads              # Gestão de leads
  ├── /opportunities      # Pipeline de vendas
  ├── /activities         # Timeline de atividades
  ├── /calls              # Histórico de ligações
  ├── /emails             # Gestão de emails
  ├── /whatsapp           # Conversas WhatsApp
  ├── /campaigns          # Campanhas de outreach
  ├── /tasks              # Tarefas e follow-ups
  ├── /reports            # Relatórios e analytics
  ├── /settings           # Configurações
  └── /admin              # Administração (apenas admins)
```

### **Detalhamento por Módulo**

#### 1. **Dashboard Home** (`/dashboard`)
- **Cards de métricas:**
  - Total de leads
  - Leads qualificados
  - Oportunidades abertas
  - Receita prevista
  - Taxa de conversão
  - Atividades hoje

- **Gráficos:**
  - Funil de vendas (pipeline)
  - Evolução de leads por mês
  - Atividades por tipo
  - Performance de equipe

- **Widgets:**
  - Tarefas pendentes
  - Próximas ligações agendadas
  - Leads sem follow-up
  - Últimas atividades

#### 2. **Leads** (`/dashboard/leads`)
**Já implementado, mas vamos expandir:**

- **Visualizações:**
  - Lista (atual)
  - Kanban (por estágio)
  - Mapa (geolocalização por UF/cidade)

- **Filtros avançados:** (expandir os atuais)
  - Por estágio (NEW, CONTACTED, QUALIFIED, etc)
  - Por score (0-100)
  - Por vendedor assignado
  - Por fonte (MANUAL, IMPORT, API, etc)
  - Por tags
  - Por última atividade
  - Por receita estimada
  - Filtros customizados salvos

- **Ações em massa:**
  - Atribuir leads
  - Adicionar tags
  - Mudar estágio
  - Exportar selecionados
  - Adicionar a campanha
  - Deletar

- **Detalhes do Lead:** (modal atual expandido)
  - **Aba Overview:**
    - Dados da empresa
    - Dados de contato
    - Score e estágio
    - Vendedor responsável
    - Tags

  - **Aba Timeline:**
    - Todas as atividades cronológicas
    - Chamadas, emails, WhatsApp, notas
    - Filtro por tipo de atividade

  - **Aba Oportunidades:**
    - Lista de oportunidades associadas
    - Criar nova oportunidade

  - **Aba Tarefas:**
    - Tarefas pendentes
    - Criar nova tarefa

  - **Aba Notas:**
    - Notas fixadas
    - Histórico de notas
    - Editor rich text

#### 3. **Pipeline de Oportunidades** (`/dashboard/opportunities`)

- **Visualização Kanban:**
  - Colunas por estágio (PROSPECTING → CLOSED WON)
  - Drag-and-drop entre estágios
  - Card mostra:
    - Nome da oportunidade
    - Empresa
    - Valor
    - Probabilidade
    - Data prevista de fechamento
    - Responsável

- **Visualização Lista:**
  - Tabela com todas as oportunidades
  - Ordenação por valor, data, probabilidade
  - Filtros por estágio, responsável, período

- **Detalhes da Oportunidade:**
  - Informações gerais
  - Produtos/serviços
  - Histórico de mudanças de estágio
  - Documentos anexados
  - Timeline de atividades

#### 4. **Atividades** (`/dashboard/activities`)

- **Timeline unificada:**
  - Todas as interações (calls, emails, whatsapp, meetings)
  - Filtro por tipo, lead, responsável, período
  - Scroll infinito

- **Detalhes por tipo:**
  - **Chamadas:** Duração, gravação, transcrição, sentimento
  - **Emails:** Subject, preview, tracking (aberto, clicado)
  - **WhatsApp:** Mensagem, mídia anexada
  - **Reuniões:** Data, participantes, notas

#### 5. **Chamadas** (`/dashboard/calls`)

- **Lista de chamadas:**
  - Filtro por status, resultado, período
  - Ordenação por data, duração

- **Discador integrado:**
  - Click-to-call direto do CRM
  - Popup durante chamada com:
    - Dados do lead
    - Histórico de interações
    - Script sugerido
    - Campo para notas em tempo real

- **Análise de IA:**
  - Transcrição automática
  - Resumo da conversa
  - Análise de sentimento
  - Palavras-chave extraídas
  - Próximos passos sugeridos

#### 6. **Emails** (`/dashboard/emails`)

- **Caixa de entrada:**
  - Emails recebidos (inbound)
  - Vinculação automática com leads

- **Campanhas de email:**
  - Email em massa com merge tags
  - Agendamento de envio
  - Templates salvos
  - Tracking de opens/clicks

- **Composer:**
  - Editor rich text
  - Templates
  - Anexos
  - Variáveis dinâmicas ({{leadName}}, {{companyName}})

#### 7. **WhatsApp** (`/dashboard/whatsapp`)

- **Interface de chat:**
  - Lista de conversas
  - Chat box estilo WhatsApp Web
  - Envio de texto, imagens, documentos

- **Templates:**
  - Templates pré-aprovados (Twilio)
  - Quick replies

- **Automação:**
  - Respostas automáticas
  - Chatbot básico

#### 8. **Campanhas** (`/dashboard/campaigns`)

- **Lista de campanhas:**
  - Ativas, agendadas, concluídas
  - Métricas por campanha

- **Criar campanha:**
  - Tipo: Cold Call, Email, WhatsApp, Multi-channel
  - Segmentação de leads (filtros)
  - Template/script
  - Agendamento

- **Dashboard de campanha:**
  - Total de leads
  - Contatados
  - Respondidos
  - Qualificados
  - Convertidos
  - Taxa de resposta
  - Taxa de conversão

#### 9. **Tarefas** (`/dashboard/tasks`)

- **Visualizações:**
  - Hoje
  - Esta semana
  - Atrasadas
  - Todas

- **Quadro Kanban:**
  - TODO, IN_PROGRESS, DONE

- **Criar tarefa:**
  - Título e descrição
  - Lead associado
  - Responsável
  - Data de vencimento
  - Prioridade
  - Lembretes

#### 10. **Relatórios** (`/dashboard/reports`)

- **Relatórios pré-definidos:**
  - Sales Pipeline Report
  - Lead Source Analysis
  - Conversion Rate by Stage
  - Activity Summary (calls, emails, whatsapp)
  - Team Performance
  - Revenue Forecast

- **Construtor de relatórios:**
  - Drag-and-drop
  - Filtros customizados
  - Exportar PDF/Excel

- **Dashboards:**
  - Widgets personalizáveis
  - Refresh automático
  - Compartilhamento

#### 11. **Configurações** (`/dashboard/settings`)

- **Perfil:**
  - Nome, email, avatar
  - Notificações

- **Integrações:**
  - Twilio (Voice + WhatsApp)
  - SendGrid/Resend
  - OpenAI API

- **Equipe:**
  - Usuários
  - Permissões (RBAC)
  - Times

- **Templates:**
  - Email templates
  - WhatsApp templates
  - Call scripts

- **Automações:**
  - Criar/editar workflows
  - Trigger conditions
  - Actions

- **Tags:**
  - Gerenciar tags
  - Cores e ícones

---

## 🔄 Fluxos de Trabalho (Workflows)

### **Fluxo 1: Cold Call Outbound**

1. Vendedor filtra leads (CNAE, UF, score)
2. Cria campanha "Cold Call - SP Farma Q1"
3. Sistema segmenta 500 leads
4. Vendedor abre discador
5. Click-to-call no primeiro lead
6. Durante chamada:
   - Popup mostra dados do lead
   - Script sugerido
   - Campo para notas
7. Ao finalizar:
   - Escolhe outcome (INTERESTED, CALLBACK, etc)
   - Define próxima ação (tarefa follow-up)
8. Sistema:
   - Grava ligação
   - Transcreve com Whisper
   - Analisa sentimento
   - Atualiza lead stage
   - Cria atividade na timeline
   - Atribui score +10 se interessado
9. Próximo lead automaticamente

### **Fluxo 2: Email Drip Campaign**

1. Criar campanha "Email - Apresentação Produto X"
2. Segmentar leads: CNAE 1234, ATIVA, sem contato nos últimos 30 dias
3. Escolher template "Apresentação Inicial"
4. Agendar: 3 emails com intervalos de 3 dias
   - Email 1: Apresentação
   - Email 2: Benefícios (se não abriu email 1)
   - Email 3: Chamada para ação (se abriu mas não clicou)
5. Sistema envia automaticamente
6. Tracking:
   - Email aberto → Lead score +5
   - Link clicado → Lead score +15, mudar stage para CONTACTED
   - Resposta → Criar task para vendedor responder

### **Fluxo 3: WhatsApp Follow-up**

1. Lead respondeu email demonstrando interesse
2. Sistema cria task automática: "WhatsApp follow-up"
3. Vendedor abre WhatsApp inbox
4. Envia template pré-aprovado + mensagem personalizada
5. Lead responde
6. Conversa estilo chat
7. Vendedor agenda reunião
8. Sistema:
   - Marca task como concluída
   - Cria evento no calendário (futuro)
   - Atualiza lead stage para QUALIFIED
   - Cria oportunidade automaticamente

### **Fluxo 4: Lead Scoring Automático**

**Sistema de pontos:**
- Lead criado: 0 pontos
- Email aberto: +5
- Email clicado: +15
- Chamada atendida: +20
- WhatsApp respondido: +10
- Reunião agendada: +30
- Oportunidade criada: +50
- Sem atividade 30 dias: -10

**Classificação:**
- 0-20: Cold
- 21-50: Warm
- 51-80: Hot
- 81-100: Very Hot

**Automações baseadas em score:**
- Score >= 80 → Notificar gerente + criar task urgente
- Score <= 10 → Adicionar a campanha de nutrição
- Score 50-80 por 7 dias → Sugerir agendamento de reunião

---

## 🤖 Integrações de IA

### **OpenAI GPT-4**

**Uso 1: Análise de Transcrições**
```typescript
// Após transcrever chamada com Whisper
const analysis = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{
    role: "system",
    content: "Você é um analista de vendas. Analise esta transcrição de cold call."
  }, {
    role: "user",
    content: transcription
  }],
  functions: [{
    name: "analyze_call",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string", description: "Resumo da conversa em 2-3 frases" },
        sentiment: { type: "string", enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"] },
        keywords: { type: "array", items: { type: "string" } },
        painPoints: { type: "array", items: { type: "string" } },
        nextSteps: { type: "array", items: { type: "string" } },
        probability: { type: "number", description: "Probabilidade de conversão 0-100" }
      }
    }
  }]
});
```

**Uso 2: Geração de Templates**
- Sugerir subject lines para emails
- Gerar respostas automáticas para WhatsApp
- Criar scripts de cold call personalizados por CNAE

**Uso 3: Lead Enrichment**
- Sugerir perguntas de qualificação baseadas no CNAE
- Identificar gatilhos de compra
- Análise de concorrência

### **Whisper API**

**Transcrição de chamadas:**
```typescript
const transcription = await openai.audio.transcriptions.create({
  file: audioFile,
  model: "whisper-1",
  language: "pt",
  response_format: "verbose_json",
  timestamp_granularities: ["segment"]
});
```

---

## 📱 Componentes UI Principais

### **1. Command Palette (Cmd+K)**
```tsx
<CommandPalette>
  - Buscar leads por nome/CNPJ
  - Buscar oportunidades
  - Criar nova tarefa
  - Fazer ligação rápida
  - Enviar email
  - Ir para página
</CommandPalette>
```

### **2. Kanban Board**
```tsx
<KanbanBoard
  columns={stages}
  onDragEnd={handleStageChange}
  renderCard={OpportunityCard}
/>
```

### **3. Timeline**
```tsx
<Timeline activities={activities}>
  <ActivityItem type="call" />
  <ActivityItem type="email" />
  <ActivityItem type="whatsapp" />
  <ActivityItem type="note" />
</Timeline>
```

### **4. Dialer Widget**
```tsx
<DialerWidget
  lead={currentLead}
  onCall={handleCall}
  onHangup={handleHangup}
  showNotes={true}
  showScript={true}
/>
```

### **5. Rich Text Editor**
```tsx
<EmailComposer
  templates={templates}
  variables={leadVariables}
  attachments={true}
  scheduling={true}
/>
```

---

## 🔐 Permissões (RBAC)

### **Roles e Permissões**

| Recurso | ADMIN | MANAGER | SALES_REP | SDR | VIEWER |
|---------|-------|---------|-----------|-----|--------|
| Ver todos leads | ✅ | ✅ | ❌ (só seus) | ❌ (só seus) | ✅ |
| Atribuir leads | ✅ | ✅ | ❌ | ❌ | ❌ |
| Editar leads | ✅ | ✅ | ✅ (só seus) | ✅ (só seus) | ❌ |
| Deletar leads | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver oportunidades | ✅ | ✅ | ✅ (só suas) | ❌ | ✅ |
| Criar oportunidades | ✅ | ✅ | ✅ | ❌ | ❌ |
| Fazer ligações | ✅ | ✅ | ✅ | ✅ | ❌ |
| Enviar emails | ✅ | ✅ | ✅ | ✅ | ❌ |
| Criar campanhas | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver relatórios | ✅ | ✅ | ✅ (limitado) | ✅ (limitado) | ✅ |
| Gerenciar equipe | ✅ | ✅ (seu time) | ❌ | ❌ | ❌ |
| Configurações | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 📊 Métricas e KPIs

### **Dashboard Principal**

**Métricas Gerais:**
- Total de leads
- Leads ativos (ATIVA + SUSPENSA)
- Taxa de qualificação (%)
- Leads por vendedor
- Score médio

**Pipeline:**
- Valor total em pipeline
- Oportunidades abertas
- Receita prevista (este mês/trimestre/ano)
- Taxa de fechamento (win rate)

**Atividades:**
- Ligações hoje/semana/mês
- Duração média de chamadas
- Taxa de atendimento
- Emails enviados
- Taxa de abertura/cliques
- WhatsApp enviados/respondidos

**Performance:**
- Leads contatados vs. meta
- Taxa de conversão por estágio
- Tempo médio em cada estágio
- Receita por vendedor
- Atividades por vendedor

---

## 🚀 Roadmap de Implementação

### **Fase 1: Core CRM (Semanas 1-3)**
✅ Database schema completo (Prisma)
✅ Autenticação e RBAC
✅ CRUD de Leads (expandir atual)
✅ CRUD de Oportunidades
✅ Pipeline Kanban
✅ Timeline de atividades
✅ Sistema de tarefas
✅ Notas
✅ Tags

### **Fase 2: Comunicação (Semanas 4-6)**
- Integração Twilio Voice
- Dialer + gravação
- Transcrição com Whisper
- Análise de IA (GPT-4)
- Integração SendGrid/Resend
- Email templates
- Tracking de opens/clicks
- WhatsApp via Twilio
- Chat interface
- Templates WhatsApp

### **Fase 3: Automação e Campanhas (Semanas 7-8)**
- Sistema de campanhas
- Segmentação avançada
- Email drip campaigns
- Automações (workflows)
- Lead scoring automático
- Follow-up automático

### **Fase 4: Analytics e Reporting (Semanas 9-10)**
- Dashboards customizáveis
- Relatórios pré-definidos
- Exportação PDF/Excel
- Forecast de receita
- Performance de equipe

### **Fase 5: Refinamento e UX (Semanas 11-12)**
- Command Palette (Cmd+K)
- Notificações em tempo real (Supabase Realtime)
- Mobile responsive
- Dark mode
- Onboarding
- Tour guiado

---

## 🎯 Diferenciais vs Salesforce

### **O que teremos igual/similar:**
- ✅ Pipeline visual (Kanban)
- ✅ Gestão de leads e oportunidades
- ✅ Timeline de atividades
- ✅ Email tracking
- ✅ Relatórios e dashboards
- ✅ RBAC (permissões)
- ✅ Automações
- ✅ Campanhas

### **Nossos diferenciais:**
- 🚀 **IA nativa**: Análise de chamadas, sentimento, resumos
- 🚀 **WhatsApp integrado**: Salesforce não tem nativamente
- 🚀 **Foco B2B Brasil**: Dados CNPJ, BrasilAPI, filtros por CNAE
- 🚀 **Custo**: $0 vs $25-150/usuário/mês
- 🚀 **Simples e rápido**: Sem bloat, interface moderna
- 🚀 **Self-hosted**: Controle total dos dados

---

## 💰 Modelo de Custos (Estimativa mensal)

**Infraestrutura:**
- Supabase (Pro): $25/mês
- Vercel (Pro): $20/mês
- OpenAI API: ~$50-200/mês (depende do uso)
- Twilio Voice: $0.013/min (variável)
- Twilio WhatsApp: $0.005/msg (variável)
- SendGrid: $15-20/mês (até 50k emails)

**Total Base:** ~$130-300/mês

**Por usuário (comparação):**
- FrascoLife: ~$10-30/usuário/mês
- Salesforce: $25-150/usuário/mês
- HubSpot: $45-120/usuário/mês
- Pipedrive: $15-99/usuário/mês

**Economia: 50-80% vs Salesforce!**

---

## 📝 Próximos Passos Técnicos

1. **Atualizar Prisma Schema**
   - Adicionar todos os models descritos acima
   - Rodar migrations

2. **Criar estrutura de pastas**
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── first-access/
│   ├── dashboard/
│   │   ├── page.tsx                    # Home
│   │   ├── leads/                      # Já existe
│   │   ├── opportunities/
│   │   │   ├── page.tsx                # Lista
│   │   │   ├── [id]/                   # Detalhes
│   │   │   └── components/
│   │   │       ├── kanban-board.tsx
│   │   │       └── opportunity-card.tsx
│   │   ├── activities/
│   │   ├── calls/
│   │   │   └── components/
│   │   │       └── dialer-widget.tsx
│   │   ├── emails/
│   │   ├── whatsapp/
│   │   ├── campaigns/
│   │   ├── tasks/
│   │   ├── reports/
│   │   └── settings/
│   └── api/
│       ├── leads/                      # Já existe
│       ├── opportunities/
│       ├── activities/
│       ├── calls/
│       ├── emails/
│       ├── whatsapp/
│       ├── campaigns/
│       ├── tasks/
│       └── webhooks/
│           ├── twilio/
│           └── sendgrid/
├── components/
│   ├── ui/                             # Shadcn components
│   ├── crm/
│   │   ├── kanban-board.tsx
│   │   ├── timeline.tsx
│   │   ├── activity-item.tsx
│   │   ├── dialer-widget.tsx
│   │   ├── email-composer.tsx
│   │   ├── whatsapp-chat.tsx
│   │   └── command-palette.tsx
│   └── layout/
│       └── dashboard-layout.tsx        # Já existe
├── lib/
│   ├── prisma.ts
│   ├── supabase/
│   ├── twilio/
│   │   ├── voice.ts
│   │   └── whatsapp.ts
│   ├── sendgrid/
│   ├── openai/
│   │   ├── transcription.ts
│   │   └── analysis.ts
│   └── utils/
│       ├── lead-scoring.ts
│       ├── activity-logger.ts
│       └── notifications.ts
└── hooks/
    ├── useLeads.ts
    ├── useOpportunities.ts
    ├── useActivities.ts
    └── useTwilio.ts
```

3. **Instalar dependências adicionais**
```bash
npm install @tanstack/react-query zustand recharts
npm install react-hook-form zod @hookform/resolvers
npm install date-fns clsx tailwind-merge
npm install sonner cmdk
npm install twilio @sendgrid/mail openai
```

---

## ✅ Checklist de Implementação

**Antes de começar:**
- [ ] Revisar e aprovar este plano
- [ ] Decidir quais módulos implementar primeiro
- [ ] Criar contas nas plataformas (Twilio, SendGrid, OpenAI)
- [ ] Definir prioridades de features

**Ready to start?** 🚀

Posso começar pela **Fase 1** ou você quer ajustar algo neste plano primeiro?
