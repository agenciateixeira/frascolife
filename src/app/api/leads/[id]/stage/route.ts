import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// PATCH - Atualizar estágio do lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { stage } = body;

    if (!stage) {
      return NextResponse.json(
        { error: 'Estágio é obrigatório' },
        { status: 400 }
      );
    }

    // Validar estágio
    const validStages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
    if (!validStages.includes(stage)) {
      return NextResponse.json(
        { error: 'Estágio inválido' },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        stage,
        updatedAt: new Date()
      }
    });

    // Registrar atividade de mudança de estágio
    await prisma.activity.create({
      data: {
        leadId: id,
        userId: body.userId || 'system', // TODO: pegar do contexto de autenticação
        type: 'STAGE_CHANGED',
        title: 'Estágio Alterado',
        description: `Estágio alterado para ${stage}`
      }
    });

    return NextResponse.json({
      success: true,
      data: lead
    });
  } catch (error: any) {
    console.error('Error updating lead stage:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar estágio', details: error.message },
      { status: 500 }
    );
  }
}
