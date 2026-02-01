-- Criar todas as tabelas do CRM
-- Execute este SQL no Supabase SQL Editor

-- ============================================
-- USUÁRIOS E TEAMS
-- ============================================

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'SALES_REP', 'SDR', 'VIEWER');

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  supabase_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar TEXT,
  phone TEXT,
  role "UserRole" DEFAULT 'SALES_REP',
  team_id TEXT REFERENCES teams(id),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP
);

CREATE INDEX idx_users_supabase_id ON users(supabase_id);
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- OPORTUNIDADES
-- ============================================

CREATE TYPE "OpportunityStage" AS ENUM (
  'PROSPECTING',
  'QUALIFICATION',
  'NEEDS_ANALYSIS',
  'VALUE_PROPOSITION',
  'DECISION_MAKERS',
  'PROPOSAL',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST'
);

CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  stage "OpportunityStage" DEFAULT 'PROSPECTING',
  probability INTEGER DEFAULT 10,
  value DECIMAL(12,2) NOT NULL,
  expected_close_date TIMESTAMP,
  closed_at TIMESTAMP,
  won_reason TEXT,
  lost_reason TEXT,
  assigned_to_id TEXT REFERENCES users(id)
);

CREATE INDEX idx_opportunities_lead_id ON opportunities(lead_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_assigned_to ON opportunities(assigned_to_id);

-- ============================================
-- PRODUTOS
-- ============================================

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  price DECIMAL(12,2) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS opportunity_products (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  discount DECIMAL(5,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  UNIQUE(opportunity_id, product_id)
);

-- ============================================
-- ATIVIDADES
-- ============================================

CREATE TYPE "ActivityType" AS ENUM (
  'CALL',
  'EMAIL',
  'WHATSAPP',
  'MEETING',
  'NOTE',
  'TASK_COMPLETED',
  'STAGE_CHANGED',
  'ASSIGNED',
  'STATUS_CHANGED'
);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  type "ActivityType" NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
  opportunity_id TEXT REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  metadata JSONB
);

CREATE INDEX idx_activities_lead_id ON activities(lead_id);
CREATE INDEX idx_activities_opportunity_id ON activities(opportunity_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_created_at ON activities(created_at);

-- ============================================
-- CHAMADAS
-- ============================================

CREATE TYPE "CallDirection" AS ENUM ('INBOUND', 'OUTBOUND');
CREATE TYPE "CallStatus" AS ENUM ('INITIATED', 'RINGING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER', 'CANCELED');
CREATE TYPE "CallOutcome" AS ENUM ('INTERESTED', 'NOT_INTERESTED', 'CALLBACK', 'WRONG_NUMBER', 'VOICEMAIL', 'MEETING_SCHEDULED');
CREATE TYPE "Sentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

CREATE TABLE IF NOT EXISTS calls (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  direction "CallDirection" NOT NULL,
  status "CallStatus" NOT NULL,
  duration INTEGER,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  twilio_call_sid TEXT UNIQUE,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  recording_url TEXT,
  recording_sid TEXT,
  transcription TEXT,
  summary TEXT,
  sentiment "Sentiment",
  keywords TEXT[],
  notes TEXT,
  outcome "CallOutcome"
);

CREATE INDEX idx_calls_lead_id ON calls(lead_id);
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_created_at ON calls(created_at);

-- ============================================
-- EMAILS
-- ============================================

CREATE TYPE "EmailDirection" AS ENUM ('INBOUND', 'OUTBOUND');
CREATE TYPE "EmailStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED');

CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  direction "EmailDirection" NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  html_body TEXT,
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  status "EmailStatus" DEFAULT 'DRAFT',
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced_at TIMESTAMP,
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  message_id TEXT UNIQUE,
  template_id TEXT
);

CREATE INDEX idx_emails_lead_id ON emails(lead_id);
CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_status ON emails(status);
CREATE INDEX idx_emails_sent_at ON emails(sent_at);

CREATE TABLE IF NOT EXISTS email_attachments (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  email_id TEXT NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  filesize INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  url TEXT NOT NULL
);

CREATE INDEX idx_email_attachments_email_id ON email_attachments(email_id);

CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  html_body TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  variables TEXT[]
);

-- ============================================
-- WHATSAPP
-- ============================================

CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');
CREATE TYPE "MessageContentType" AS ENUM ('TEXT', 'IMAGE', 'DOCUMENT', 'AUDIO', 'VIDEO');
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  direction "MessageDirection" NOT NULL,
  content TEXT NOT NULL,
  content_type "MessageContentType" DEFAULT 'TEXT',
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  status "MessageStatus" DEFAULT 'PENDING',
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  failed_at TIMESTAMP,
  twilio_message_sid TEXT UNIQUE,
  error_message TEXT,
  media_url TEXT
);

CREATE INDEX idx_whatsapp_messages_lead_id ON whatsapp_messages(lead_id);
CREATE INDEX idx_whatsapp_messages_user_id ON whatsapp_messages(user_id);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_created_at ON whatsapp_messages(created_at);

CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  twilio_sid TEXT UNIQUE
);

-- ============================================
-- TAREFAS
-- ============================================

CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');
CREATE TYPE "ReminderMethod" AS ENUM ('EMAIL', 'NOTIFICATION', 'WHATSAPP');

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
  assigned_to_id TEXT NOT NULL REFERENCES users(id),
  due_date TIMESTAMP NOT NULL,
  priority "TaskPriority" DEFAULT 'MEDIUM',
  status "TaskStatus" DEFAULT 'TODO',
  completed_at TIMESTAMP,
  completed_by TEXT
);

CREATE INDEX idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX idx_tasks_assigned_to_id ON tasks(assigned_to_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

CREATE TABLE IF NOT EXISTS task_reminders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  remind_at TIMESTAMP NOT NULL,
  method "ReminderMethod" DEFAULT 'EMAIL',
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP
);

CREATE INDEX idx_task_reminders_task_id ON task_reminders(task_id);
CREATE INDEX idx_task_reminders_remind_at ON task_reminders(remind_at);

-- ============================================
-- NOTAS
-- ============================================

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  content TEXT NOT NULL,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  created_by_id TEXT NOT NULL REFERENCES users(id),
  is_pinned BOOLEAN DEFAULT false
);

CREATE INDEX idx_notes_lead_id ON notes(lead_id);
CREATE INDEX idx_notes_created_by_id ON notes(created_by_id);
CREATE INDEX idx_notes_created_at ON notes(created_at);

-- ============================================
-- TAGS
-- ============================================

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS lead_tags (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(lead_id, tag_id)
);

CREATE INDEX idx_lead_tags_lead_id ON lead_tags(lead_id);
CREATE INDEX idx_lead_tags_tag_id ON lead_tags(tag_id);

-- ============================================
-- CAMPANHAS
-- ============================================

CREATE TYPE "CampaignType" AS ENUM ('COLD_CALL', 'EMAIL', 'WHATSAPP', 'MULTI_CHANNEL');
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELED');
CREATE TYPE "CampaignLeadStatus" AS ENUM ('PENDING', 'CONTACTED', 'RESPONDED', 'QUALIFIED', 'CONVERTED', 'SKIPPED');

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  type "CampaignType" NOT NULL,
  status "CampaignStatus" DEFAULT 'DRAFT',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  owner_id TEXT NOT NULL REFERENCES users(id),
  team_id TEXT REFERENCES teams(id),
  filters JSONB,
  total_leads INTEGER DEFAULT 0,
  contacted_leads INTEGER DEFAULT 0,
  qualified_leads INTEGER DEFAULT 0,
  won_leads INTEGER DEFAULT 0
);

CREATE INDEX idx_campaigns_owner_id ON campaigns(owner_id);
CREATE INDEX idx_campaigns_team_id ON campaigns(team_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

CREATE TABLE IF NOT EXISTS campaign_leads (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  status "CampaignLeadStatus" DEFAULT 'PENDING',
  priority INTEGER DEFAULT 0,
  contacted_at TIMESTAMP,
  responded_at TIMESTAMP,
  outcome TEXT,
  UNIQUE(campaign_id, lead_id)
);

CREATE INDEX idx_campaign_leads_campaign_id ON campaign_leads(campaign_id);
CREATE INDEX idx_campaign_leads_lead_id ON campaign_leads(lead_id);
CREATE INDEX idx_campaign_leads_status ON campaign_leads(status);

-- ============================================
-- FIM
-- ============================================

SELECT 'CRM tables created successfully!' AS status;
