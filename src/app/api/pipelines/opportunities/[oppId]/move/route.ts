import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// PATCH /api/pipelines/opportunities/[oppId]/move - Mover oportunidade entre estágios
export async function PATCH(
  request: NextRequest,
  { params }: { params: { oppId: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { oppId } = params;
    const body = await request.json();
    const { stageId } = body;

    if (!stageId) {
      return NextResponse.json(
        { success: false, error: 'stageId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar oportunidade atual
    const currentOpp = await prisma.pipelineOpportunity.findUnique({
      where: { id: oppId },
      include: { stage: true }
    });

    if (!currentOpp) {
      return NextResponse.json(
        { success: false, error: 'Oportunidade não encontrada' },
        { status: 404 }
      );
    }

    // Calcular duração no estágio anterior
    const duration = Math.floor(
      (new Date().getTime() - currentOpp.enteredStageAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Criar registro no histórico
    await prisma.pipelineStageHistory.create({
      data: {
        opportunityId: oppId,
        fromStageId: currentOpp.stageId,
        toStageId: stageId,
        movedById: user.id,
        duration
      }
    });

    // Atualizar oportunidade
    const updatedOpp = await prisma.pipelineOpportunity.update({
      where: { id: oppId },
      data: {
        stageId,
        enteredStageAt: new Date()
      },
      include: {
        stage: true,
        lead: true,
        owner: true
      }
    });

    return NextResponse.json({ success: true, data: updatedOpp });
  } catch (error) {
    console.error('Error moving opportunity:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao mover oportunidade' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
