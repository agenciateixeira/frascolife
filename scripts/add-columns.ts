import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding missing columns to companies table...');

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE companies
      ADD COLUMN IF NOT EXISTS cnaes_secundarios TEXT,
      ADD COLUMN IF NOT EXISTS natureza_juridica TEXT,
      ADD COLUMN IF NOT EXISTS porte TEXT,
      ADD COLUMN IF NOT EXISTS capital_social TEXT,
      ADD COLUMN IF NOT EXISTS data_situacao_cadastral TEXT;
    `);

    console.log('✅ Columns added successfully!');
  } catch (error) {
    console.error('Error adding columns:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
