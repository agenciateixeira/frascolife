-- Dropar tabelas antigas de campanhas se existirem
-- Execute ANTES de create-crm-tables.sql

DROP TABLE IF EXISTS campaign_companies CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS call_logs CASCADE;
DROP TABLE IF EXISTS company_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

SELECT 'Old tables dropped successfully!' AS status;
