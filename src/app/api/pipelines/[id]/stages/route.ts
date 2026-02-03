import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// POST /api/pipelines/[id]/stages - Criar novo estágio
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: pipelineId } = params;
    const body = await request.json();
    const { name, description, color, icon, probability, order, rottingDays } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    // Se order não foi especificado, adicionar no final
    let stageOrder = order;
    if (stageOrder === undefined) {
      const lastStage = await prisma.pipelineStage.findFirst({
        where: { pipelineId },
        orderBy: { order: 'desc' }
      });
      stageOrder = (lastStage?.order || 0) + 1;
    }

    const stage = await prisma.pipelineStage.create({
      data: {
        pipelineId,
        name,
        description,
        color: color || '#6B7280',
        icon,
        order: stageOrder,
        probability: probability || 0,
        rottingDays
      }
    });

    return NextResponse.json({ success: true, data: stage });
  } catch (error) {
    console.error('Error creating stage:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar estágio' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH /api/pipelines/[id]/stages - Reordenar estágios
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: pipelineId } = params;
    const body = await request.json();
    const { stages } = body; // Array de { id, order }

    if (!stages || !Array.isArray(stages)) {
      return NextResponse.json(
        { success: false, error: 'Stages array é obrigatório' },
        { status: 400 }
      );
    }

    // Atualizar ordem de todos os estágios
    await Promise.all(
      stages.map(stage =>
        prisma.pipelineStage.update({
          where: { id: stage.id },
          data: { order: stage.order }
        })
      )
    );

    const updatedStages = await prisma.pipelineStage.findMany({
      where: { pipelineId },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ success: true, data: updatedStages });
  } catch (error) {
    console.error('Error reordering stages:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao reordenar estágios' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
