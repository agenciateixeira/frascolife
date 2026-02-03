'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Calendar,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Activity
} from 'lucide-react';

interface DashboardStats {
  overview: {
    totalLeads: number;
    leadsThisMonth: number;
    leadGrowthRate: number;
    wonLeads: number;
    lostLeads: number;
    activeLeads: number;
    conversionRate: number;
    totalOpportunityValue: number;
    wonOpportunityValue: number;
  };
  activities: {
    activitiesThisMonth: number;
    callsThisMonth: number;
    emailsThisMonth: number;
  };
  tasks: {
    overdue: number;
    dueToday: number;
  };
  funnel: Array<{
    stage: string;
    count: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string;
    user: {
      id: string;
      fullName: string;
      email: string;
      avatar: string | null;
    };
    lead: {
      id: string;
      fantasia: string | null;
      razaoSocial: string;
    } | null;
  }>;
  topSalesReps: Array<{
    user: {
      id: string;
      fullName: string;
      email: string;
      avatar: string | null;
    };
    wonDeals: number;
  }>;
}

const stageLabels: Record<string, string> = {
  NEW: 'Novo',
  CONTACTED: 'Contatado',
  QUALIFIED: 'Qualificado',
  PROPOSAL: 'Proposta',
  NEGOTIATION: 'Negociação'
};

const activityIcons: Record<string, any> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  NOTE: Activity,
  TASK: CheckCircle
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  async function fetchStats() {
    try {
      const response = await fetch('/api/dashboard/stats', {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      } else {
        console.error('Error fetching stats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  async function checkAuth() {
    const supabase = createBrowserClient();

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, role')
      .eq('id', session.user.id)
      .single();

    setUser({
      id: session.user.id,
      email: session.user.email,
      name: (profile as any)?.full_name || session.user.email,
      role: (profile as any)?.role || 'user'
    });

    setLoading(false);
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#25d366] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Bem-vindo de volta, {user.name}!
          </p>
        </div>

        {stats ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Leads */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stats.overview.totalLeads.toLocaleString('pt-BR')}
                    </p>
                    <div className="flex items-center mt-2">
                      {stats.overview.leadGrowthRate >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${stats.overview.leadGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(stats.overview.leadGrowthRate)}% este mês
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stats.overview.conversionRate}%
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {stats.overview.wonLeads} ganhos / {stats.overview.totalLeads} total
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Pipeline Value */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valor no Pipeline</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatCurrency(stats.overview.totalOpportunityValue)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {stats.overview.activeLeads} oportunidades ativas
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tarefas</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stats.tasks.dueToday}
                    </p>
                    <div className="flex items-center mt-2">
                      {stats.tasks.overdue > 0 ? (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-sm text-red-600">
                            {stats.tasks.overdue} atrasadas
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600">
                            Em dia
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section: Funnel + Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Funnel */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Funil de Vendas
                </h3>
                <div className="space-y-4">
                  {stats.funnel.map((stage, index) => {
                    const maxCount = Math.max(...stats.funnel.map(s => s.count), 1);
                    const percentage = (stage.count / maxCount) * 100;

                    return (
                      <div key={stage.stage}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {stageLabels[stage.stage] || stage.stage}
                          </span>
                          <span className="text-sm text-gray-600">
                            {stage.count.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Ativos</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {stats.overview.activeLeads}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ganhos</p>
                      <p className="text-lg font-semibold text-green-600">
                        {stats.overview.wonLeads}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Perdidos</p>
                      <p className="text-lg font-semibold text-red-600">
                        {stats.overview.lostLeads}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Atividades Este Mês
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="font-medium text-gray-900">Ligações</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats.activities.callsThisMonth}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-green-600 mr-3" />
                      <span className="font-medium text-gray-900">Emails</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {stats.activities.emailsThisMonth}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <Activity className="w-5 h-5 text-purple-600 mr-3" />
                      <span className="font-medium text-gray-900">Total de Atividades</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      {stats.activities.activitiesThisMonth}
                    </span>
                  </div>
                </div>

                {/* Top Sales Reps */}
                {stats.topSalesReps.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Top Vendedores Este Mês
                    </h4>
                    <div className="space-y-3">
                      {stats.topSalesReps.slice(0, 3).map((rep, index) => (
                        <div key={rep.user.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600 mr-3">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {rep.user.fullName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {rep.wonDeals} negócios ganhos
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Atividades Recentes
              </h3>
              <div className="space-y-4">
                {stats.recentActivities.slice(0, 8).map((activity) => {
                  const Icon = activityIcons[activity.type] || Activity;

                  return (
                    <div key={activity.id} className="flex items-start border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {activity.description}
                        </p>
                        {activity.lead && (
                          <p className="text-xs text-gray-500 mt-1">
                            Lead: {activity.lead.fantasia || activity.lead.razaoSocial}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex flex-col items-end">
                        <span className="text-xs text-gray-500">
                          {formatDate(activity.createdAt)}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          {activity.user.fullName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow border border-gray-200 text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando estatísticas...</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
