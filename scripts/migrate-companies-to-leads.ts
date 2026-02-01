import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Iniciando migração: companies → leads\n');

  try {
    // 1. Renomear tabela
    console.log('1️⃣ Renomeando tabela companies → leads...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE companies RENAME TO leads;
    `);
    console.log('✅ Tabela renomeada\n');

    // 2. Adicionar novas colunas CRM
    console.log('2️⃣ Adicionando colunas CRM...');

    const newColumns = [
      // CRM Fields
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'NEW'`,
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0`,
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'IMPORT'`,

      // Vendedor assignado
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to_id TEXT`,
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP`,

      // Contato principal (pessoa)
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_name TEXT`,
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_role TEXT`,
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_phone TEXT`,
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_email TEXT`,
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_linked_in TEXT`,

      // Qualificação
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_qualified BOOLEAN DEFAULT false`,
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS qualified_at TIMESTAMP`,
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS disqualified_reason TEXT`,

      // Estimativas
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_revenue DECIMAL(12,2)`,
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_close_date TIMESTAMP`,
      `ALTER TABLE leads ADD COLUMN IF NOT EXISTS probability INTEGER`,
    ];

    for (const sql of newColumns) {
      await prisma.$executeRawUnsafe(sql);
    }

    console.log('✅ Colunas CRM adicionadas\n');

    // 3. Atualizar stage para todos os leads existentes baseado em situacaoCadastral
    console.log('3️⃣ Atualizando stage inicial dos leads...');
    await prisma.$executeRawUnsafe(`
      UPDATE leads
      SET stage = CASE
        WHEN "situacaoCadastral" = 'ATIVA' THEN 'NEW'
        WHEN "situacaoCadastral" = 'SUSPENSA' THEN 'NURTURING'
        ELSE 'LOST'
      END
      WHERE stage = 'NEW';
    `);
    console.log('✅ Stages atualizados\n');

    // 4. Atualizar source para IMPORT (já que todos vieram de CSV)
    console.log('4️⃣ Atualizando source...');
    await prisma.$executeRawUnsafe(`
      UPDATE leads SET source = 'IMPORT' WHERE source IS NULL OR source = '';
    `);
    console.log('✅ Source atualizado\n');

    // 5. Criar índices para performance
    console.log('5️⃣ Criando índices...');
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage)`,
      `CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score)`,
      `CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to_id)`,
    ];

    for (const sql of indexes) {
      await prisma.$executeRawUnsafe(sql);
    }
    console.log('✅ Índices criados\n');

    // 6. Estatísticas
    const total = await prisma.$queryRaw`SELECT COUNT(*) as count FROM leads`;
    const byStage = await prisma.$queryRaw`
      SELECT stage, COUNT(*) as count
      FROM leads
      GROUP BY stage
      ORDER BY count DESC
    `;

    console.log('📊 ESTATÍSTICAS:');
    console.log(`Total de leads: ${(total as any)[0].count}`);
    console.log('\nLeads por estágio:');
    (byStage as any[]).forEach(row => {
      console.log(`  ${row.stage}: ${row.count}`);
    });

    console.log('\n✨ Migração concluída com sucesso!');

  } catch (error: any) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
