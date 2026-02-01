/**
 * Script para importar 1 milhão de registros do CSV para o PostgreSQL
 * Otimizado para evitar estouro de memória usando streams e batches
 */

import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configurações
const CSV_FILE = './cnpj.csv';
const BATCH_SIZE = 1000; // Insere 1000 registros por vez
const MAX_RECORDS = 1_000_000; // Limita a 1 milhão
const SKIP_FIRST_LINES = 0; // Ajuste se houver cabeçalho

interface CompanyData {
  cnpj: string;
  cnpjBase: string;
  cnpjOrder: string;
  cnpjDv: string;
  matrizFilial: string;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  situacaoCadastral: string;
  dataSituacao: string | null;
  dataAbertura: string | null;
  cnaePrincipal: string | null;
  cnaeSecundario: string | null;
  tipoLogradouro: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cep: string | null;
  uf: string | null;
  municipio: string | null;
  ddd1: string | null;
  telefone1: string | null;
  ddd2: string | null;
  telefone2: string | null;
  dddFax: string | null;
  fax: string | null;
  email: string | null;
}

function parseCSVLine(line: string): CompanyData | null {
  try {
    // Remove aspas e divide por ponto-e-vírgula
    const fields = line.split(';').map(f => f.replace(/^"|"$/g, '').trim());

    // Valida se tem campos mínimos
    if (fields.length < 30) {
      return null;
    }

    const [
      cnpjBase,      // 0
      cnpjOrder,     // 1
      cnpjDv,        // 2
      matrizFilial,  // 3
      nomeFantasia,  // 4
      ,              // 5 - situação especial
      dataSituacao,  // 6
      situacaoCadastral, // 7
      ,              // 8 - motivo situação
      ,              // 9 - cidade exterior
      dataAbertura,  // 10
      cnaePrincipal, // 11
      cnaeSecundario,// 12
      tipoLogradouro,// 13
      logradouro,    // 14
      numero,        // 15
      complemento,   // 16
      bairro,        // 17
      cep,           // 18
      uf,            // 19
      municipio,     // 20
      ddd1,          // 21
      telefone1,     // 22
      ddd2,          // 23
      telefone2,     // 24
      dddFax,        // 25
      fax,           // 26
      email,         // 27
    ] = fields;

    const cnpj = `${cnpjBase}${cnpjOrder}${cnpjDv}`;

    return {
      cnpj,
      cnpjBase: cnpjBase || '',
      cnpjOrder: cnpjOrder || '',
      cnpjDv: cnpjDv || '',
      matrizFilial: matrizFilial || '1',
      razaoSocial: null, // Não disponível no CSV
      nomeFantasia: nomeFantasia || null,
      situacaoCadastral: situacaoCadastral || '01',
      dataSituacao: dataSituacao || null,
      dataAbertura: dataAbertura || null,
      cnaePrincipal: cnaePrincipal || null,
      cnaeSecundario: cnaeSecundario || null,
      tipoLogradouro: tipoLogradouro || null,
      logradouro: logradouro || null,
      numero: numero || null,
      complemento: complemento || null,
      bairro: bairro || null,
      cep: cep || null,
      uf: uf || null,
      municipio: municipio || null,
      ddd1: ddd1 || null,
      telefone1: telefone1 || null,
      ddd2: ddd2 || null,
      telefone2: telefone2 || null,
      dddFax: dddFax || null,
      fax: fax || null,
      email: email || null,
    };
  } catch (error) {
    console.error('Erro ao parsear linha:', error);
    return null;
  }
}

async function importCSV() {
  console.log('🚀 Iniciando importação de 1 milhão de registros...\n');

  const startTime = Date.now();
  let lineCount = 0;
  let importedCount = 0;
  let errorCount = 0;
  let batch: CompanyData[] = [];

  const fileStream = createReadStream(CSV_FILE);
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  try {
    for await (const line of rl) {
      // Pula linhas iniciais se necessário
      if (lineCount < SKIP_FIRST_LINES) {
        lineCount++;
        continue;
      }

      // Para após 1 milhão
      if (importedCount >= MAX_RECORDS) {
        console.log(`\n✅ Limite de ${MAX_RECORDS.toLocaleString()} registros atingido!`);
        break;
      }

      lineCount++;

      const data = parseCSVLine(line);

      if (data) {
        batch.push(data);

        // Insere em lote quando atingir BATCH_SIZE
        if (batch.length >= BATCH_SIZE) {
          try {
            await prisma.company.createMany({
              data: batch,
              skipDuplicates: true, // Ignora CNPJs duplicados
            });

            importedCount += batch.length;

            // Progress indicator
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const rate = (importedCount / parseFloat(elapsed)).toFixed(0);
            const percent = ((importedCount / MAX_RECORDS) * 100).toFixed(1);

            process.stdout.write(
              `\r📊 Progresso: ${importedCount.toLocaleString()}/${MAX_RECORDS.toLocaleString()} ` +
              `(${percent}%) | ${rate} reg/s | Erros: ${errorCount}`
            );

            batch = [];
          } catch (error) {
            console.error(`\n❌ Erro ao inserir batch:`, error);
            errorCount += batch.length;
            batch = [];
          }
        }
      } else {
        errorCount++;
      }
    }

    // Insere últimos registros do batch
    if (batch.length > 0) {
      try {
        await prisma.company.createMany({
          data: batch,
          skipDuplicates: true,
        });
        importedCount += batch.length;
      } catch (error) {
        console.error(`\n❌ Erro ao inserir último batch:`, error);
        errorCount += batch.length;
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const avgRate = (importedCount / parseFloat(totalTime)).toFixed(0);

    console.log('\n\n✅ Importação concluída!\n');
    console.log('📈 Estatísticas:');
    console.log(`   - Total importado: ${importedCount.toLocaleString()} registros`);
    console.log(`   - Total de erros: ${errorCount.toLocaleString()}`);
    console.log(`   - Tempo total: ${totalTime}s`);
    console.log(`   - Taxa média: ${avgRate} registros/segundo`);

  } catch (error) {
    console.error('\n❌ Erro fatal durante importação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executa a importação
importCSV().catch(console.error);
