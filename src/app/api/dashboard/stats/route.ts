import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET /api/dashboard/stats - Obter estatísticas completas do dashboard
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Data de início do mês atual
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const endOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

    // Buscar todas as estatísticas em paralelo
    const [
      totalLeads,
      leadsThisMonth,
      leadsLastMonth,
      wonLeads,
      lostLeads,
      activeLeads,
      totalOpportunities,
      wonOpportunities,
      activitiesThisMonth,
      callsThisMonth,
      emailsThisMonth,
      tasksOverdue,
      tasksDueToday,
      leadsByStage,
      recentActivities,
      topSalesReps
    ] = await Promise.all([
      // Total de leads
      prisma.lead.count(),

      // Leads criados este mês
      prisma.lead.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      }),

      // Leads criados mês passado
      prisma.lead.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      }),

      // Leads ganhos
      prisma.lead.count({
        where: { stage: 'WON' }
      }),

      // Leads perdidos
      prisma.lead.count({
        where: { stage: 'LOST' }
      }),

      // Leads ativos (não WON/LOST)
      prisma.lead.count({
        where: {
          stage: { notIn: ['WON', 'LOST'] }
        }
      }),

      // Total de oportunidades
      prisma.opportunity.findMany({
        where: {
          stage: { notIn: ['WON', 'LOST'] }
        },
        select: { value: true }
      }),

      // Oportunidades ganhas
      prisma.opportunity.findMany({
        where: { stage: 'WON' },
        select: { value: true }
      }),

      // Atividades este mês
      prisma.activity.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      }),

      // Ligações este mês
      prisma.activity.count({
        where: {
          type: 'CALL',
          createdAt: { gte: startOfMonth }
        }
      }),

      // Emails este mês
      prisma.activity.count({
        where: {
          type: 'EMAIL',
          createdAt: { gte: startOfMonth }
        }
      }),

      // Tarefas atrasadas
      prisma.task.count({
        where: {
          status: { in: ['TODO', 'IN_PROGRESS'] },
          dueDate: { lt: new Date() }
        }
      }),

      // Tarefas para hoje
      prisma.task.count({
        where: {
          status: { in: ['TODO', 'IN_PROGRESS'] },
          dueDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),

      // Leads por estágio
      prisma.lead.groupBy({
        by: ['stage'],
        _count: { id: true },
        where: {
          stage: { notIn: ['WON', 'LOST'] }
        }
      }),

      // Atividades recentes
      prisma.activity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true
            }
          },
          lead: {
            select: {
              id: true,
              fantasia: true,
              razaoSocial: true
            }
          }
        }
      }),

      // Top vendedores (leads ganhos este mês)
      prisma.lead.groupBy({
        by: ['assignedToId'],
        where: {
          stage: 'WON',
          updatedAt: { gte: startOfMonth },
          assignedToId: { not: null }
        },
        _count: { id: true },
        orderBy: {
          _count: { id: 'desc' }
        },
        take: 5
      })
    ]);

    // Calcular valor total de oportunidades
    const totalOpportunityValue = totalOpportunities.reduce((sum, opp) => {
      return sum + Number(opp.value);
    }, 0);

    const wonOpportunityValue = wonOpportunities.reduce((sum, opp) => {
      return sum + Number(opp.value);
    }, 0);

    // Calcular taxa de conversão
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(2) : '0.00';

    // Calcular taxa de crescimento de leads
    const leadGrowthRate = leadsLastMonth > 0
      ? (((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100).toFixed(2)
      : '0.00';

    // Buscar informações dos top vendedores
    const topSalesRepsWithDetails = await Promise.all(
      topSalesReps.map(async (rep) => {
        if (!rep.assignedToId) return null;

        const user = await prisma.user.findUnique({
          where: { id: rep.assignedToId },
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true
          }
        });

        return {
          user,
          wonDeals: rep._count.id
        };
      })
    );

    // Preparar dados do funil
    const stageOrder = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION'];
    const funnelData = stageOrder.map(stage => {
      const stageData = leadsByStage.find(s => s.stage === stage);
      return {
        stage,
        count: stageData?._count.id || 0
      };
    });

    return NextResponse.json({
      overview: {
        totalLeads,
        leadsThisMonth,
        leadGrowthRate: parseFloat(leadGrowthRate),
        wonLeads,
        lostLeads,
        activeLeads,
        conversionRate: parseFloat(conversionRate),
        totalOpportunityValue,
        wonOpportunityValue
      },
      activities: {
        activitiesThisMonth,
        callsThisMonth,
        emailsThisMonth
      },
      tasks: {
        overdue: tasksOverdue,
        dueToday: tasksDueToday
      },
      funnel: funnelData,
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        createdAt: activity.createdAt,
        user: activity.user,
        lead: activity.lead
      })),
      topSalesReps: topSalesRepsWithDetails.filter(rep => rep !== null)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas do dashboard' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
