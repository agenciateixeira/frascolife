import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// PUT /api/leads/[id]/assign - Atribuir lead a um usuário
export async function PUT(
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

    const { id } = params;
    const { assignedToId, reason } = await request.json();

    if (!assignedToId) {
      return NextResponse.json({ error: 'assignedToId é obrigatório' }, { status: 400 });
    }

    // Verificar se o lead existe
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: true
      }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    const previousAssignee = lead.assignedTo;

    // Atualizar o lead
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        assignedToId,
        updatedAt: new Date()
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    // Registrar atividade de atribuição
    await prisma.activity.create({
      data: {
        type: 'ASSIGNMENT_CHANGED',
        title: 'Lead Atribuído',
        description: previousAssignee
          ? `Lead transferido de ${previousAssignee.fullName} para ${updatedLead.assignedTo?.fullName}${reason ? `. Motivo: ${reason}` : ''}`
          : `Lead atribuído para ${updatedLead.assignedTo?.fullName}${reason ? `. Motivo: ${reason}` : ''}`,
        leadId: id,
        userId: user.id
      }
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Error assigning lead:', error);
    return NextResponse.json(
      { error: 'Erro ao atribuir lead' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
