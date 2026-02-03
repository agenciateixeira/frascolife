import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkColumns() {
  try {
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'leads'
      AND column_name IN ('cnaes_secundarios', 'cnaesSecundarios', 'natureza_juridica', 'porte', 'capital_social', 'data_situacao_cadastral')
      ORDER BY column_name;
    `);

    console.log('Colunas encontradas na tabela leads:');
    console.log(result);
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkColumns();
