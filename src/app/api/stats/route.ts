import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [total, ativas, suspensas] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { situacaoCadastral: 'ATIVA' } }),
      prisma.lead.count({ where: { situacaoCadastral: 'SUSPENSA' } })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalLeads: total,
        ativas,
        suspensas,
        campanhas: 0, // TODO: implementar quando tiver campanhas
        ligacoes: 0   // TODO: implementar quando tiver ligações
      }
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas', details: error.message },
      { status: 500 }
    );
  }
}
