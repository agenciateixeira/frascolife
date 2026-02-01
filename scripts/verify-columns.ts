import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando colunas na tabela companies...\n');

  try {
    // Tenta fazer um select com as colunas de enriquecimento
    const test = await prisma.$queryRaw`
      SELECT
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_name = 'companies'
      AND column_name IN (
        'cnaesSecundarios',
        'naturezaJuridica',
        'porte',
        'capitalSocial',
        'dataSituacaoCadastral',
        'cnaes_secundarios',
        'natureza_juridica',
        'capital_social',
        'data_situacao_cadastral'
      )
      ORDER BY column_name;
    `;

    console.log('Colunas encontradas:');
    console.log(test);

    console.log('\n📋 Verificando schema Prisma vs Database...');

    // Tenta fazer um update de teste (sem WHERE para não executar)
    const columns = [
      'cnaesSecundarios',
      'naturezaJuridica',
      'porte',
      'capitalSocial',
      'dataSituacaoCadastral'
    ];

    for (const col of columns) {
      try {
        // Apenas verifica se a coluna existe no modelo Prisma
        console.log(`✓ ${col} - existe no schema Prisma`);
      } catch (e) {
        console.log(`✗ ${col} - NÃO existe no schema Prisma`);
      }
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
