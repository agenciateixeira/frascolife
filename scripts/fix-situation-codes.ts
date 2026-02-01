import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeamento de códigos da Receita Federal
// Fonte: https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/cadastros/consultas/arquivos/tabela-de-situacao-cadastral
const SITUACAO_CADASTRAL_MAP: Record<string, string> = {
  '01': 'NULA',
  '02': 'ATIVA',
  '03': 'SUSPENSA',
  '04': 'INAPTA',
  '05': 'BAIXADA',  // Baixada por encerramento de atividade
  '06': 'BAIXADA',
  '07': 'BAIXADA',
  '08': 'BAIXADA',
  '09': 'SUSPENSA',
  '10': 'SUSPENSA',
  '11': 'SUSPENSA',
  '15': 'SUSPENSA',
  '16': 'SUSPENSA',
  '17': 'SUSPENSA',
  '18': 'SUSPENSA',
  '20': 'BAIXADA',
  '21': 'BAIXADA',
  '28': 'BAIXADA',
  '31': 'BAIXADA',
  '32': 'BAIXADA',
  '33': 'BAIXADA',
  '34': 'BAIXADA',
  '36': 'BAIXADA',
  '37': 'BAIXADA',
  '38': 'BAIXADA',
  '39': 'BAIXADA',
  '40': 'BAIXADA',
  '41': 'BAIXADA',
  '45': 'BAIXADA',
  '46': 'BAIXADA',
  '49': 'BAIXADA',
  '50': 'BAIXADA',
  '53': 'BAIXADA',
  '54': 'BAIXADA',
  '61': 'BAIXADA',
  '62': 'BAIXADA',
  '63': 'BAIXADA',
  '64': 'BAIXADA',
  '66': 'BAIXADA',
  '67': 'BAIXADA',
  '71': 'BAIXADA',
  '72': 'BAIXADA',
  '73': 'BAIXADA',
  '74': 'BAIXADA',
  '75': 'BAIXADA',
  '80': 'BAIXADA',
  '81': 'BAIXADA',
  '82': 'BAIXADA',
  '00': 'ATIVA',  // Situação normal/ativa
};

async function main() {
  console.log('🔄 Convertendo códigos de situação cadastral...\n');

  try {
    let totalUpdated = 0;

    for (const [code, status] of Object.entries(SITUACAO_CADASTRAL_MAP)) {
      const result = await prisma.company.updateMany({
        where: {
          situacaoCadastral: code
        },
        data: {
          situacaoCadastral: status
        }
      });

      if (result.count > 0) {
        console.log(`✅ Código ${code} → ${status}: ${result.count.toLocaleString('pt-BR')} empresas`);
        totalUpdated += result.count;
      }
    }

    console.log(`\n🎉 Total atualizado: ${totalUpdated.toLocaleString('pt-BR')} empresas`);

    // Verificar resultado
    console.log('\n📊 Nova distribuição:');
    const newDistribution = await prisma.company.groupBy({
      by: ['situacaoCadastral'],
      _count: true,
      orderBy: {
        _count: {
          situacaoCadastral: 'desc'
        }
      }
    });

    newDistribution.forEach(status => {
      console.log(`   ${status.situacaoCadastral}: ${status._count.toLocaleString('pt-BR')}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
