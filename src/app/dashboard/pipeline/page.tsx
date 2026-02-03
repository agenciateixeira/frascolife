'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Building2,
  TrendingUp,
  Percent,
  DollarSign,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface PipelineStage {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  order: number;
  probability: number;
  isActive: boolean;
  isFinal: boolean;
  rottingDays: number | null;
}

interface PipelineOpportunity {
  id: string;
  title: string;
  description: string | null;
  value: number;
  expectedCloseDate: string | null;
  enteredStageAt: string;
  stageId: string;
  stage: PipelineStage;
  lead: {
    id: string;
    cnpj: string;
    razaoSocial: string | null;
    nomeFantasia: string | null;
    municipio: string | null;
    uf: string | null;
    situacaoCadastral: string;
  };
  owner: {
    id: string;
    fullName: string | null;
    email: string;
    avatar: string | null;
  } | null;
}

interface Pipeline {
  id: string;
  name: string;
  description: string | null;
  stages: PipelineStage[];
}

function SortableOpportunityCard({
  opportunity,
  onClick
}: {
  opportunity: PipelineOpportunity;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opportunity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getDaysInStage = () => {
    const entered = new Date(opportunity.enteredStageAt);
    const now = new Date();
    const days = Math.floor((now.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-2 cursor-move"
    >
      <div
        onClick={onClick}
        className="bg-white rounded-lg p-3 border border-gray-200 hover:border-[#25d366] hover:shadow-md transition-all duration-150"
      >
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-6 h-6 bg-gradient-to-br from-[#25d366] to-[#20bd5a] rounded-md flex items-center justify-center flex-shrink-0">
                <Building2 className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-gray-900 truncate leading-tight">
                  {opportunity.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {opportunity.lead.nomeFantasia || opportunity.lead.razaoSocial}
                </p>
              </div>
            </div>
          </div>

          {/* Value */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-green-600">
              <DollarSign className="w-3 h-3" />
              <span className="text-sm font-bold">{formatCurrency(opportunity.value)}</span>
            </div>
            <span className="text-xs text-gray-500">{getDaysInStage()}d</span>
          </div>

          {/* Owner */}
          {opportunity.owner && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
                {opportunity.owner.fullName?.[0] || opportunity.owner.email[0]}
              </div>
              <span className="text-xs text-gray-600 truncate">
                {opportunity.owner.fullName || opportunity.owner.email}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DroppableStageColumn({
  stage,
  opportunities,
  onOpportunityClick,
  onStageEdit,
  onStageDelete
}: {
  stage: PipelineStage;
  opportunities: PipelineOpportunity[];
  onOpportunityClick: (opp: PipelineOpportunity) => void;
  onStageEdit: (stage: PipelineStage) => void;
  onStageDelete: (stage: PipelineStage) => void;
}) {
  const oppIds = opportunities.map(opp => opp.id);

  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const weightedValue = totalValue * (stage.probability / 100);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact'
    }).format(value);
  };

  return (
    <div className="flex-1 min-w-[280px] max-w-[320px]">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
        {/* Column Header */}
        <div style={{ backgroundColor: stage.color }} className="text-white px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">{stage.name}</h3>
              <button
                onClick={() => onStageEdit(stage)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <Settings className="w-3 h-3" />
              </button>
            </div>
            <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold">
              {opportunities.length}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Percent className="w-3 h-3" />
                <span>{stage.probability}%</span>
              </div>
              <span className="font-medium">{formatCurrency(weightedValue)}</span>
            </div>
            {totalValue > 0 && (
              <div className="text-xs opacity-80">
                Total: {formatCurrency(totalValue)}
              </div>
            )}
          </div>
        </div>

        {/* Cards Container */}
        <div className="flex-1 p-2 overflow-y-auto bg-gray-50 min-h-[500px] max-h-[calc(100vh-280px)]">
          <SortableContext items={oppIds} strategy={verticalListSortingStrategy}>
            {opportunities.map((opportunity) => (
              <SortableOpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onClick={() => onOpportunityClick(opportunity)}
              />
            ))}
          </SortableContext>

          {opportunities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                <Building2 className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-xs font-medium">Nenhuma oportunidade</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [opportunities, setOpportunities] = useState<PipelineOpportunity[]>([]);
  const [activeOpportunity, setActiveOpportunity] = useState<PipelineOpportunity | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPipeline();
    }
  }, [user]);

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
      email: session.user.email || '',
      name: (profile as any)?.full_name || session.user.email || 'Usuário',
      role: (profile as any)?.role || 'user'
    });

    setLoading(false);
  }

  async function fetchPipeline() {
    try {
      setLoading(true);

      // Buscar pipeline padrão
      const pipelineRes = await fetch('/api/pipelines', {
        credentials: 'include'
      });
      const pipelineData = await pipelineRes.json();

      if (pipelineData.success && pipelineData.data.length > 0) {
        const defaultPipeline = pipelineData.data.find((p: any) => p.isDefault) || pipelineData.data[0];
        setPipeline(defaultPipeline);

        // Buscar oportunidades
        const oppRes = await fetch(`/api/pipelines/${defaultPipeline.id}/opportunities`, {
          credentials: 'include'
        });
        const oppData = await oppRes.json();

        if (oppData.success) {
          setOpportunities(oppData.data);
          setAnalytics(oppData.analytics);
        }
      }
    } catch (error) {
      console.error('Error fetching pipeline:', error);
      toast.error('Erro ao carregar pipeline');
    } finally {
      setLoading(false);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const opp = opportunities.find(o => o.id === event.active.id);
    setActiveOpportunity(opp || null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveOpportunity(null);

    if (!over) return;

    const opportunityId = active.id as string;
    const overId = over.id as string;

    // Verificar se soltou em outro card ou em uma stage
    let newStageId: string | undefined;

    // Se soltou em outro opportunity, pegar o stage dele
    const targetOpp = opportunities.find(o => o.id === overId);
    if (targetOpp) {
      newStageId = targetOpp.stageId;
    } else {
      // Senão, verificar se é um stage
      newStageId = pipeline?.stages.find(s => s.id === overId)?.id;
    }

    if (!newStageId) return;

    const opp = opportunities.find(o => o.id === opportunityId);
    if (!opp || opp.stageId === newStageId) return;

    // Optimistic update
    setOpportunities(prev =>
      prev.map(o =>
        o.id === opportunityId
          ? { ...o, stageId: newStageId!, enteredStageAt: new Date().toISOString() }
          : o
      )
    );

    try {
      const response = await fetch(`/api/pipelines/opportunities/${opportunityId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ stageId: newStageId })
      });

      const data = await response.json();

      if (!data.success) {
        fetchPipeline();
        toast.error('Erro ao mover oportunidade');
      } else {
        toast.success('Oportunidade movida com sucesso!');
      }
    } catch (error) {
      console.error('Error moving opportunity:', error);
      fetchPipeline();
      toast.error('Erro ao mover oportunidade');
    }
  }

  function handleOpportunityClick(opp: PipelineOpportunity) {
    router.push(`/dashboard/leads/${opp.lead.id}`);
  }

  function handleStageEdit(stage: PipelineStage) {
    toast.info('Modal de edição de estágio (em desenvolvimento)');
  }

  function handleStageDelete(stage: PipelineStage) {
    toast.info('Deletar estágio (em desenvolvimento)');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#25d366]"></div>
      </div>
    );
  }

  if (!pipeline) {
    return (
      <DashboardLayout user={user}>
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-600 mb-4">Nenhum pipeline encontrado</p>
          <button className="px-4 py-2 bg-[#25d366] text-white rounded-lg">
            Criar Pipeline
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Agrupar oportunidades por estágio
  const opportunitiesByStage = pipeline.stages.reduce((acc, stage) => {
    acc[stage.id] = opportunities.filter(opp => opp.stageId === stage.id);
    return acc;
  }, {} as Record<string, PipelineOpportunity[]>);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-4">
        {/* Header com Analytics */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pipeline.name}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {pipeline.description || 'Gerencie suas oportunidades por estágio'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <button className="px-4 py-2 bg-[#25d366] text-white rounded-lg hover:bg-[#20bd5a] transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Oportunidade
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        {analytics && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-xs text-gray-600 mb-1">Oportunidades</div>
              <div className="text-2xl font-bold text-gray-900">{analytics.totalOpportunities}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-xs text-gray-600 mb-1">Valor Total</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalValue)}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-xs text-gray-600 mb-1">Receita Prevista</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(analytics.weightedValue)}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-xs text-gray-600 mb-1">Ticket Médio</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.avgValue)}</div>
            </div>
          </div>
        )}

        {/* Pipeline Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-4">
            {pipeline.stages.map((stage) => (
              <DroppableStageColumn
                key={stage.id}
                stage={stage}
                opportunities={opportunitiesByStage[stage.id] || []}
                onOpportunityClick={handleOpportunityClick}
                onStageEdit={handleStageEdit}
                onStageDelete={handleStageDelete}
              />
            ))}
          </div>

          <DragOverlay>
            {activeOpportunity && (
              <div className="rotate-2 opacity-90 scale-105">
                <div className="bg-white rounded-lg p-3 border-2 border-[#25d366] shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-[#25d366] to-[#20bd5a] rounded-md flex items-center justify-center">
                      <Building2 className="h-3 w-3 text-white" />
                    </div>
                    <p className="font-semibold text-xs text-gray-900">
                      {activeOpportunity.title}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </DashboardLayout>
  );
}
