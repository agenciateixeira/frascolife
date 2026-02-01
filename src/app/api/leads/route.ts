import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Paginação
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Filtros
    const cnpj = searchParams.get('cnpj');
    const razaoSocial = searchParams.get('razaoSocial');
    const nomeFantasia = searchParams.get('nomeFantasia');
    const uf = searchParams.get('uf');
    const municipio = searchParams.get('municipio');
    const cnaePrincipal = searchParams.get('cnaePrincipal');
    const situacaoCadastral = searchParams.get('situacaoCadastral');
    const matrizFilial = searchParams.get('matrizFilial');

    // Construir where clause
    const where: any = {};

    if (cnpj) {
      where.cnpj = { contains: cnpj };
    }

    if (razaoSocial) {
      where.razaoSocial = { contains: razaoSocial, mode: 'insensitive' };
    }

    if (nomeFantasia) {
      where.nomeFantasia = { contains: nomeFantasia, mode: 'insensitive' };
    }

    if (uf) {
      where.uf = uf;
    }

    if (municipio) {
      where.municipio = { contains: municipio, mode: 'insensitive' };
    }

    if (cnaePrincipal) {
      where.cnaePrincipal = { contains: cnaePrincipal };
    }

    if (situacaoCadastral) {
      where.situacaoCadastral = situacaoCadastral;
    }

    if (matrizFilial) {
      where.matrizFilial = matrizFilial;
    }

    // Buscar dados
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          cnpj: true,
          razaoSocial: true,
          nomeFantasia: true,
          situacaoCadastral: true,
          matrizFilial: true,
          cnaePrincipal: true,
          uf: true,
          municipio: true,
          logradouro: true,
          numero: true,
          bairro: true,
          cep: true,
          telefone1: true,
          ddd1: true,
          email: true,
        }
      }),
      prisma.company.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar leads', details: error.message },
      { status: 500 }
    );
  }
}
