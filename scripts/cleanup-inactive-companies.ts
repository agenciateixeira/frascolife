import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Iniciando limpeza de empresas inativas...\n');

  try {
    // Contagem antes
    const totalBefore = await prisma.company.count();
    console.log(`📊 Total de empresas ANTES: ${totalBefore.toLocaleString('pt-BR')}`);

    const ativas = await prisma.company.count({ where: { situacaoCadastral: 'ATIVA' } });
    const suspensas = await prisma.company.count({ where: { situacaoCadastral: 'SUSPENSA' } });
    const baixadas = await prisma.company.count({ where: { situacaoCadastral: 'BAIXADA' } });
    const nulas = await prisma.company.count({ where: { situacaoCadastral: 'NULA' } });

    console.log(`✅ Empresas ATIVAS: ${ativas.toLocaleString('pt-BR')} - MANTER`);
    console.log(`⚠️  Empresas SUSPENSAS: ${suspensas.toLocaleString('pt-BR')} - MANTER`);
    console.log(`❌ Empresas BAIXADAS: ${baixadas.toLocaleString('pt-BR')} - DELETAR`);
    console.log(`⭕ Empresas NULAS: ${nulas.toLocaleString('pt-BR')} - DELETAR\n`);

    // Deletar BAIXADAS
    console.log('🗑️  Deletando empresas BAIXADAS...');
    const deletedBaixadas = await prisma.company.deleteMany({
      where: { situacaoCadastral: 'BAIXADA' }
    });
    console.log(`✅ Deletadas: ${deletedBaixadas.count.toLocaleString('pt-BR')} empresas\n`);

    // Deletar NULAS
    console.log('🗑️  Deletando empresas NULAS...');
    const deletedNulas = await prisma.company.deleteMany({
      where: { situacaoCadastral: 'NULA' }
    });
    console.log(`✅ Deletadas: ${deletedNulas.count.toLocaleString('pt-BR')} empresas\n`);

    // Contagem depois
    const totalAfter = await prisma.company.count();
    const deleted = totalBefore - totalAfter;

    console.log('📊 RESULTADO FINAL:');
    console.log(`   Total ANTES: ${totalBefore.toLocaleString('pt-BR')}`);
    console.log(`   Total DEPOIS: ${totalAfter.toLocaleString('pt-BR')}`);
    console.log(`   Total DELETADO: ${deleted.toLocaleString('pt-BR')} (${((deleted/totalBefore)*100).toFixed(2)}%)`);

    // Mostrar exemplos de empresas que ficaram
    console.log('\n📋 Exemplos de empresas que permaneceram:');
    const samples = await prisma.company.findMany({
      select: {
        cnpj: true,
        razaoSocial: true,
        nomeFantasia: true,
        situacaoCadastral: true,
        uf: true,
        municipio: true
      },
      take: 10
    });

    samples.forEach((company, index) => {
      console.log(`\n${index + 1}. ${company.razaoSocial || company.nomeFantasia || 'N/A'}`);
      console.log(`   CNPJ: ${company.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}`);
      console.log(`   Situação: ${company.situacaoCadastral}`);
      console.log(`   Local: ${company.municipio || 'N/A'} - ${company.uf || 'N/A'}`);
    });

    console.log('\n✨ Limpeza concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
