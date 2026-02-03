import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET /api/users/workload - Obter carga de trabalho de todos os vendedores
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar todos os usuários com role SALES_REP ou SALES_MANAGER
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['SALES_REP', 'SALES_MANAGER'] }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
        role: true
      }
    });

    // Para cada usuário, buscar estatísticas de leads
    const workloads = await Promise.all(
      users.map(async (user) => {
        const [
          totalLeads,
          activeLeads,
          leadsThisMonth,
          wonThisMonth,
          lostThisMonth,
          overdueTasks
        ] = await Promise.all([
          // Total de leads atribuídos
          prisma.lead.count({
            where: { assignedToId: user.id }
          }),

          // Leads ativos (não WON/LOST)
          prisma.lead.count({
            where: {
              assignedToId: user.id,
              stage: { notIn: ['WON', 'LOST'] }
            }
          }),

          // Leads novos este mês
          prisma.lead.count({
            where: {
              assignedToId: user.id,
              createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          }),

          // Leads ganhos este mês
          prisma.lead.count({
            where: {
              assignedToId: user.id,
              stage: 'WON',
              updatedAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          }),

          // Leads perdidos este mês
          prisma.lead.count({
            where: {
              assignedToId: user.id,
              stage: 'LOST',
              updatedAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              }
            }
          }),

          // Tarefas atrasadas
          prisma.task.count({
            where: {
              assignedToId: user.id,
              status: { in: ['TODO', 'IN_PROGRESS'] },
              dueDate: { lt: new Date() }
            }
          })
        ]);

        // Calcular valor total de oportunidades abertas
        const opportunities = await prisma.opportunity.findMany({
          where: {
            lead: { assignedToId: user.id },
            stage: { notIn: ['WON', 'LOST'] }
          },
          select: { value: true }
        });

        const totalOpportunityValue = opportunities.reduce((sum, opp) => {
          return sum + Number(opp.value);
        }, 0);

        return {
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            avatar: user.avatar,
            role: user.role
          },
          stats: {
            totalLeads,
            activeLeads,
            leadsThisMonth,
            wonThisMonth,
            lostThisMonth,
            overdueTasks,
            totalOpportunityValue,
            conversionRate: totalLeads > 0 ? ((wonThisMonth / totalLeads) * 100).toFixed(2) : '0.00'
          }
        };
      })
    );

    // Ordenar por leads ativos (carga de trabalho)
    workloads.sort((a, b) => b.stats.activeLeads - a.stats.activeLeads);

    return NextResponse.json({ workloads });
  } catch (error) {
    console.error('Error fetching workload:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar carga de trabalho' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
