import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

type DistributionMethod = 'round-robin' | 'manual' | 'by-region' | 'by-workload';

// POST /api/leads/bulk-assign - Atribuir múltiplos leads
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadIds, method, assignToIds, reason } = await request.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'leadIds é obrigatório e deve ser um array' }, { status: 400 });
    }

    if (!method) {
      return NextResponse.json({ error: 'method é obrigatório' }, { status: 400 });
    }

    let assignments: { leadId: string; assignedToId: string }[] = [];

    // Distribuição Round-Robin
    if (method === 'round-robin') {
      if (!assignToIds || assignToIds.length === 0) {
        return NextResponse.json({ error: 'assignToIds é obrigatório para round-robin' }, { status: 400 });
      }

      assignments = leadIds.map((leadId, index) => ({
        leadId,
        assignedToId: assignToIds[index % assignToIds.length]
      }));
    }

    // Distribuição Manual (todos para o mesmo vendedor)
    else if (method === 'manual') {
      if (!assignToIds || assignToIds.length !== 1) {
        return NextResponse.json({ error: 'assignToIds deve conter exatamente um ID para distribuição manual' }, { status: 400 });
      }

      assignments = leadIds.map(leadId => ({
        leadId,
        assignedToId: assignToIds[0]
      }));
    }

    // Distribuição por Região
    else if (method === 'by-region') {
      // Buscar leads com suas regiões
      const leads = await prisma.lead.findMany({
        where: { id: { in: leadIds } },
        select: { id: true, uf: true }
      });

      // Buscar usuários com suas regiões
      const users = await prisma.user.findMany({
        where: { id: { in: assignToIds } },
        select: { id: true }
        // TODO: Adicionar campo 'regions' no User model para armazenar UFs atribuídas
      });

      // Por enquanto, fazer round-robin como fallback
      assignments = leads.map((lead, index) => ({
        leadId: lead.id,
        assignedToId: assignToIds[index % assignToIds.length]
      }));
    }

    // Distribuição por Carga de Trabalho
    else if (method === 'by-workload') {
      // Buscar carga atual de cada vendedor
      const workloads = await Promise.all(
        assignToIds.map(async (userId: string) => {
          const count = await prisma.lead.count({
            where: {
              assignedToId: userId,
              stage: { notIn: ['WON', 'LOST'] } // Apenas leads ativos
            }
          });
          return { userId, count };
        })
      );

      // Ordenar por carga (menor para maior)
      workloads.sort((a, b) => a.count - b.count);

      // Atribuir leads começando pelos vendedores com menor carga
      assignments = leadIds.map((leadId, index) => {
        const assignee = workloads[index % workloads.length];
        return {
          leadId,
          assignedToId: assignee.userId
        };
      });
    }

    // Executar atribuições
    const results = await Promise.all(
      assignments.map(async ({ leadId, assignedToId }) => {
        try {
          const lead = await prisma.lead.update({
            where: { id: leadId },
            data: {
              assignedToId,
              updatedAt: new Date()
            },
            include: {
              assignedTo: {
                select: {
                  id: true,
                  fullName: true,
                  email: true
                }
              }
            }
          });

          // Registrar atividade
          await prisma.activity.create({
            data: {
              type: 'ASSIGNMENT_CHANGED',
              title: 'Lead Atribuído (Distribuição em Lote)',
              description: `Lead atribuído para ${lead.assignedTo?.fullName} via ${method}${reason ? `. Motivo: ${reason}` : ''}`,
              leadId,
              userId: user.id
            }
          });

          return { success: true, leadId, assignedTo: lead.assignedTo };
        } catch (error) {
          console.error(`Error assigning lead ${leadId}:`, error);
          return { success: false, leadId, error: 'Erro ao atribuir lead' };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      total: leadIds.length,
      successCount,
      failCount,
      results
    });
  } catch (error) {
    console.error('Error bulk assigning leads:', error);
    return NextResponse.json(
      { error: 'Erro ao atribuir leads em lote' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
