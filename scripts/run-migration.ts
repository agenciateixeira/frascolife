/**
 * Script para executar migrations SQL no Supabase
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function runMigration() {
  try {
    console.log('🚀 Executando migration no Supabase...\n')

    // Ler arquivo SQL
    const migrationPath = join(process.cwd(), 'supabase/migrations/20260201000001_create_auth_tables.sql')
    const sql = readFileSync(migrationPath, 'utf-8')

    // Executar SQL
    await prisma.$executeRawUnsafe(sql)

    console.log('✅ Migration executada com sucesso!\n')
    console.log('Tabelas criadas:')
    console.log('  - pre_users')
    console.log('  - profiles')
    console.log('  - Políticas RLS configuradas')
    console.log('  - Functions criadas')

  } catch (error) {
    console.error('❌ Erro ao executar migration:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runMigration()
