import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // 'email', 'phone', 'all'

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    let results: any[] = [];

    // Busca por email
    if (type === 'email' || type === 'all') {
      const emailResults = await prisma.lead.findMany({
        where: {
          AND: [
            {
              email: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              email: {
                not: null
              }
            }
          ]
        },
        select: {
          email: true
        },
        distinct: ['email'],
        take: 10
      });

      results.push(...emailResults.map(r => ({
        type: 'email',
        value: r.email
      })));
    }

    // Busca por telefone
    if (type === 'phone' || type === 'all') {
      const phoneQuery = query.replace(/\D/g, '');

      const phoneResults = await prisma.lead.findMany({
        where: {
          AND: [
            {
              OR: [
                {
                  telefone1: {
                    contains: phoneQuery
                  }
                },
                {
                  ddd1: {
                    contains: phoneQuery
                  }
                }
              ]
            },
            {
              telefone1: {
                not: null
              }
            }
          ]
        },
        select: {
          ddd1: true,
          telefone1: true
        },
        take: 10
      });

      const uniquePhones = new Map();
      phoneResults.forEach(r => {
        if (r.ddd1 && r.telefone1) {
          const key = `${r.ddd1}${r.telefone1}`;
          uniquePhones.set(key, {
            type: 'phone',
            value: `(${r.ddd1}) ${r.telefone1}`
          });
        }
      });

      results.push(...Array.from(uniquePhones.values()));
    }

    // Busca por razão social, nome fantasia, CNPJ
    if (type === 'all' || !type) {
      const companyResults = await prisma.lead.findMany({
        where: {
          OR: [
            {
              razaoSocial: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              nomeFantasia: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              cnpj: {
                contains: query.replace(/\D/g, '')
              }
            }
          ]
        },
        select: {
          cnpj: true,
          razaoSocial: true,
          nomeFantasia: true
        },
        take: 5
      });

      results.push(...companyResults.map(r => ({
        type: 'company',
        value: r.razaoSocial || r.nomeFantasia,
        cnpj: r.cnpj
      })));
    }

    return NextResponse.json({
      success: true,
      data: results.slice(0, 15)
    });

  } catch (error: any) {
    console.error('Error searching leads:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados', details: error.message },
      { status: 500 }
    );
  }
}
