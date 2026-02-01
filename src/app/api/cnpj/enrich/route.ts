import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

interface BrasilAPIResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  cnaes_secundarios?: Array<{
    codigo: number;
    descricao: string;
  }>;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  uf: string;
  municipio: string;
  ddd_telefone_1: string;
  ddd_telefone_2?: string;
  email: string;
  qualificacao_do_responsavel: string;
  capital_social: number;
  porte: string;
  natureza_juridica: string;
  situacao_cadastral: string;
  data_situacao_cadastral: string;
  data_inicio_atividade: string;
  qsa?: Array<{
    identificador_de_socio: number;
    nome_socio: string;
    cnpj_cpf_do_socio: string;
    qualificacao_socio: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[ENRICH] Request body:', body);

    const { cnpj, companyId } = body;

    if (!cnpj) {
      console.error('[ENRICH] CNPJ missing');
      return NextResponse.json(
        { error: 'CNPJ é obrigatório' },
        { status: 400 }
      );
    }

    // Remove formatação do CNPJ
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    console.log(`[ENRICH] Clean CNPJ: ${cleanCNPJ}`);

    // Consulta BrasilAPI
    console.log(`[ENRICH] Fetching from BrasilAPI...`);
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);

    console.log(`[ENRICH] BrasilAPI status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ENRICH] BrasilAPI error: ${errorText}`);

      if (response.status === 404) {
        return NextResponse.json(
          { error: 'CNPJ não encontrado na Receita Federal' },
          { status: 404 }
        );
      }
      throw new Error(`BrasilAPI retornou status ${response.status}: ${errorText}`);
    }

    const data: BrasilAPIResponse = await response.json();
    console.log('[ENRICH] BrasilAPI data received:', Object.keys(data));

    // Extrai telefones do formato DDD + Telefone
    const extractPhone = (dddTelefone: string) => {
      if (!dddTelefone) return { ddd: null, telefone: null };
      const cleaned = dddTelefone.replace(/\D/g, '');
      if (cleaned.length >= 10) {
        return {
          ddd: cleaned.substring(0, 2),
          telefone: cleaned.substring(2)
        };
      }
      return { ddd: null, telefone: null };
    };

    const phone1 = extractPhone(data.ddd_telefone_1);
    const phone2 = data.ddd_telefone_2 ? extractPhone(data.ddd_telefone_2) : { ddd: null, telefone: null };

    // Prepara dados para atualização
    const updateData: any = {
      razaoSocial: data.razao_social || null,
      nomeFantasia: data.nome_fantasia || null,
      situacaoCadastral: data.situacao_cadastral || null,
      cnaePrincipal: data.cnae_fiscal ? data.cnae_fiscal.toString() : null,
      logradouro: data.logradouro || null,
      numero: data.numero || null,
      complemento: data.complemento || null,
      bairro: data.bairro || null,
      cep: data.cep?.replace(/\D/g, '') || null,
      uf: data.uf || null,
      municipio: data.municipio || null,
      ddd1: phone1.ddd,
      telefone1: phone1.telefone,
      ddd2: phone2.ddd,
      telefone2: phone2.telefone,
      email: data.email || null,
      naturezaJuridica: data.natureza_juridica || null,
      porte: data.porte || null,
      capitalSocial: data.capital_social ? data.capital_social.toString() : null,
      dataAbertura: data.data_inicio_atividade || null,
      dataSituacaoCadastral: data.data_situacao_cadastral || null,
      cnaesSecundarios: data.cnaes_secundarios
        ? data.cnaes_secundarios.map(c => `${c.codigo} - ${c.descricao}`).join('; ')
        : null,
      updatedAt: new Date()
    };

    // Atualiza no banco de dados se companyId foi fornecido
    if (companyId) {
      console.log(`[ENRICH] Updating company ${companyId}...`);
      try {
        await prisma.company.update({
          where: { id: companyId },
          data: updateData
        });
        console.log('[ENRICH] Company updated successfully');
      } catch (dbError: any) {
        console.error('[ENRICH] Database error:', dbError);
        throw new Error(`Erro ao atualizar banco de dados: ${dbError.message}`);
      }
    }

    console.log('[ENRICH] Success!');
    return NextResponse.json({
      success: true,
      message: 'Dados enriquecidos com sucesso',
      data: updateData
    });

  } catch (error: any) {
    console.error('[ENRICH] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao enriquecer dados do CNPJ', details: error.message },
      { status: 500 }
    );
  }
}
