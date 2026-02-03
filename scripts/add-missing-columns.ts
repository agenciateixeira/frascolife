import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMissingColumns() {
  try {
    // Adicionar colunas que estão faltando
    await prisma.$executeRawUnsafe(`
      ALTER TABLE leads
      ADD COLUMN IF NOT EXISTS cnaes_secundarios TEXT,
      ADD COLUMN IF NOT EXISTS natureza_juridica TEXT,
      ADD COLUMN IF NOT EXISTS porte TEXT,
      ADD COLUMN IF NOT EXISTS capital_social TEXT,
      ADD COLUMN IF NOT EXISTS data_situacao_cadastral TEXT;
    `);

    console.log('✅ Colunas adicionadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao adicionar colunas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingColumns();
