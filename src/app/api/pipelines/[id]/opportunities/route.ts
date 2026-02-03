import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET /api/pipelines/[id]/opportunities - Buscar oportunidades do pipeline
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Fix auth - temporarily bypassing to test pipeline
    // const cookieStore = await cookies();
    // const supabase = createServerClient(cookieStore);
    // const { data: { user } } = await supabase.auth.getUser();

    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id: pipelineId } = params;

    const opportunities = await prisma.pipelineOpportunity.findMany({
      where: {
        pipelineId,
        closedAt: null // Apenas oportunidades abertas
      },
      include: {
        stage: true,
        lead: {
          select: {
            id: true,
            cnpj: true,
            razaoSocial: true,
            nomeFantasia: true,
            municipio: true,
            uf: true,
            email: true,
            telefone1: true,
            ddd1: true,
            situacaoCadastral: true
          }
        },
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: [
        { stage: { order: 'asc' } },
        { createdAt: 'desc' }
      ]
    });

    // Calcular analytics
    const totalValue = opportunities.reduce((sum, opp) => sum + Number(opp.value), 0);
    const weightedValue = opportunities.reduce(
      (sum, opp) => sum + (Number(opp.value) * opp.stage.probability / 100),
      0
    );

    return NextResponse.json({
      success: true,
      data: opportunities,
      analytics: {
        totalOpportunities: opportunities.length,
        totalValue,
        weightedValue,
        avgValue: opportunities.length > 0 ? totalValue / opportunities.length : 0
      }
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar oportunidades' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/pipelines/[id]/opportunities - Criar oportunidade
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
    const { leadId, stageId, title, description, value, expectedCloseDate, ownerId } = body;

    if (!leadId || !stageId || !title) {
      return NextResponse.json(
        { success: false, error: 'leadId, stageId e title são obrigatórios' },
        { status: 400 }
      );
    }

    const opportunity = await prisma.pipelineOpportunity.create({
      data: {
        pipelineId,
        leadId,
        stageId,
        title,
        description,
        value: value || 0,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        ownerId: ownerId || user.id
      },
      include: {
        stage: true,
        lead: true,
        owner: true
      }
    });

    return NextResponse.json({ success: true, data: opportunity });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar oportunidade' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
