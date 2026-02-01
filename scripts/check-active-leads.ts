import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Analisando base de dados de empresas...\n');

  try {
    // Total de empresas
    const total = await prisma.company.count();
    console.log(`📊 Total de empresas no banco: ${total.toLocaleString('pt-BR')}`);

    // Empresas ATIVAS
    const ativas = await prisma.company.count({
      where: {
        situacaoCadastral: 'ATIVA'
      }
    });
    console.log(`✅ Empresas ATIVAS: ${ativas.toLocaleString('pt-BR')} (${((ativas/total)*100).toFixed(2)}%)`);

    // Empresas BAIXADAS
    const baixadas = await prisma.company.count({
      where: {
        situacaoCadastral: 'BAIXADA'
      }
    });
    console.log(`❌ Empresas BAIXADAS: ${baixadas.toLocaleString('pt-BR')} (${((baixadas/total)*100).toFixed(2)}%)`);

    // Outros status
    const outras = total - ativas - baixadas;
    console.log(`⚠️  Outras situações: ${outras.toLocaleString('pt-BR')} (${((outras/total)*100).toFixed(2)}%)`);

    // Exemplos de empresas ativas (primeiras 5)
    if (ativas > 0) {
      console.log('\n📋 Exemplos de empresas ATIVAS:');
      const samples = await prisma.company.findMany({
        where: {
          situacaoCadastral: 'ATIVA'
        },
        select: {
          cnpj: true,
          razaoSocial: true,
          nomeFantasia: true,
          uf: true,
          municipio: true
        },
        take: 5
      });

      samples.forEach((company, index) => {
        console.log(`\n${index + 1}. ${company.razaoSocial || company.nomeFantasia || 'N/A'}`);
        console.log(`   CNPJ: ${company.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}`);
        console.log(`   Local: ${company.municipio || 'N/A'} - ${company.uf || 'N/A'}`);
      });
    }

    // Estatísticas por status
    console.log('\n📈 Distribuição por situação cadastral:');
    const statusDistribution = await prisma.company.groupBy({
      by: ['situacaoCadastral'],
      _count: true,
      orderBy: {
        _count: {
          situacaoCadastral: 'desc'
        }
      }
    });

    statusDistribution.forEach(status => {
      const percentage = ((status._count / total) * 100).toFixed(2);
      console.log(`   ${status.situacaoCadastral}: ${status._count.toLocaleString('pt-BR')} (${percentage}%)`);
    });

    console.log('\n✨ Análise concluída!');

  } catch (error) {
    console.error('❌ Erro ao analisar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
