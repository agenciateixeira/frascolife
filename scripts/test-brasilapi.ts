// Testa BrasilAPI diretamente para ver os dados reais

async function testBrasilAPI() {
  // Testa com alguns CNPJs reais
  const testCNPJs = [
    '57823635000106', // Um que você testou
    '76037654000151', // Outro que você testou
    '00000000000191', // Magazine Luiza (exemplo público)
  ];

  for (const cnpj of testCNPJs) {
    console.log('\n' + '='.repeat(80));
    console.log(`🔍 Testando CNPJ: ${cnpj}`);
    console.log('='.repeat(80));

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      console.log(`Status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();

        console.log('\n📋 DADOS RETORNADOS:');
        console.log('Razão Social:', data.razao_social);
        console.log('Nome Fantasia:', data.nome_fantasia);
        console.log('Email:', data.email);
        console.log('DDD Telefone 1:', data.ddd_telefone_1);
        console.log('DDD Telefone 2:', data.ddd_telefone_2);
        console.log('Situação:', data.situacao_cadastral);
        console.log('CNAE:', data.cnae_fiscal);
        console.log('Porte:', data.porte);
        console.log('Capital Social:', data.capital_social);

        console.log('\n📞 ANÁLISE TELEFONE:');
        console.log('ddd_telefone_1 type:', typeof data.ddd_telefone_1);
        console.log('ddd_telefone_1 value:', JSON.stringify(data.ddd_telefone_1));
        console.log('ddd_telefone_1 length:', data.ddd_telefone_1?.length);

        console.log('\n📧 ANÁLISE EMAIL:');
        console.log('email type:', typeof data.email);
        console.log('email value:', JSON.stringify(data.email));
        console.log('email length:', data.email?.length);

        console.log('\n🔢 TODOS OS CAMPOS:');
        console.log(JSON.stringify(data, null, 2));
      } else {
        const errorText = await response.text();
        console.error('Erro:', errorText);
      }
    } catch (error: any) {
      console.error('Exception:', error.message);
    }

    // Aguarda 2s entre requests para evitar rate limit
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

testBrasilAPI();
