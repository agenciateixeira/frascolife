import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email ou telefone é obrigatório' },
        { status: 400 }
      );
    }

    let where: any = {};

    if (email) {
      where.email = email;
    }

    if (phone) {
      // Remove formatação do telefone
      const cleanPhone = phone.replace(/\D/g, '');

      // Extrai DDD e número
      let ddd = '';
      let numero = '';

      if (cleanPhone.length >= 10) {
        ddd = cleanPhone.substring(0, 2);
        numero = cleanPhone.substring(2);
      }

      where.AND = [
        { ddd1: ddd },
        { telefone1: numero }
      ];
    }

    const companies = await prisma.company.findMany({
      where,
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
      },
      take: 50
    });

    return NextResponse.json({
      success: true,
      data: companies,
      total: companies.length
    });

  } catch (error: any) {
    console.error('Error fetching companies by contact:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar empresas', details: error.message },
      { status: 500 }
    );
  }
}
