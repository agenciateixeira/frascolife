import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// PATCH /api/pipelines/stages/[stageId] - Editar estágio
export async function PATCH(
  request: NextRequest,
  { params }: { params: { stageId: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stageId } = params;
    const body = await request.json();
    const { name, description, color, icon, probability, rottingDays } = body;

    const stage = await prisma.pipelineStage.update({
      where: { id: stageId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(icon !== undefined && { icon }),
        ...(probability !== undefined && { probability }),
        ...(rottingDays !== undefined && { rottingDays })
      }
    });

    return NextResponse.json({ success: true, data: stage });
  } catch (error) {
    console.error('Error updating stage:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar estágio' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/pipelines/stages/[stageId] - Deletar estágio
export async function DELETE(
  request: NextRequest,
  { params }: { params: { stageId: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stageId } = params;

    // Verificar se há oportunidades neste estágio
    const opportunitiesCount = await prisma.pipelineOpportunity.count({
      where: { stageId }
    });

    if (opportunitiesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Não é possível deletar. Existem ${opportunitiesCount} oportunidades neste estágio.`,
          opportunitiesCount
        },
        { status: 400 }
      );
    }

    await prisma.pipelineStage.delete({
      where: { id: stageId }
    });

    return NextResponse.json({ success: true, message: 'Estágio deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting stage:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar estágio' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
