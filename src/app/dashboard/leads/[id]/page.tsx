'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Edit,
  Trash2,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';

interface Lead {
  id: string;
  cnpj: string;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  situacaoCadastral: string;
  cnaePrincipal: string | null;
  stage: string;
  score: number;
  source: string;

  // Endereço
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  municipio: string | null;
  uf: string | null;
  cep: string | null;

  // Contato
  email: string | null;
  ddd1: string | null;
  telefone1: string | null;

  // Contato Principal
  contactName: string | null;
  contactRole: string | null;
  contactPhone: string | null;
  contactEmail: string | null;

  // Qualificação
  isQualified: boolean;
  qualifiedAt: string | null;

  // Estimativas
  estimatedRevenue: number | null;
  estimatedCloseDate: string | null;
  probability: number | null;

  // Relacionamentos
  assignedTo: {
    id: string;
    fullName: string | null;
    email: string;
    avatar: string | null;
    role: string;
  } | null;

  activities: any[];
  calls: any[];
  emails: any[];
  whatsappMessages: any[];
  tasks: any[];
  notes: any[];
  opportunities: any[];
  tags: any[];

  createdAt: string;
  updatedAt: string;
}

const stageColors: Record<string, string> = {
  NEW: 'bg-gray-500',
  CONTACTED: 'bg-blue-500',
  QUALIFIED: 'bg-green-500',
  PROPOSAL: 'bg-yellow-500',
  NEGOTIATION: 'bg-orange-500',
  WON: 'bg-emerald-500',
  LOST: 'bg-red-500'
};

const stageLabels: Record<string, string> = {
  NEW: 'Novo',
  CONTACTED: 'Contatado',
  QUALIFIED: 'Qualificado',
  PROPOSAL: 'Proposta',
  NEGOTIATION: 'Negociação',
  WON: 'Ganho',
  LOST: 'Perdido'
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchLead(params.id as string);
    }
  }, [params.id]);

  const fetchLead = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leads/${id}`);
      const data = await response.json();

      if (data.success) {
        setLead(data.data);
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Lead não encontrado</h2>
        <Button onClick={() => router.push('/dashboard/leads')}>
          Voltar para Leads
        </Button>
      </div>
    );
  }

  // Combinar todas as atividades para timeline
  const allActivities = [
    ...lead.activities.map(a => ({ ...a, type: 'activity' })),
    ...lead.calls.map(c => ({ ...c, type: 'call' })),
    ...lead.emails.map(e => ({ ...e, type: 'email' })),
    ...lead.whatsappMessages.map(w => ({ ...w, type: 'whatsapp' })),
    ...lead.notes.map(n => ({ ...n, type: 'note' }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/leads')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>

              <div className="h-8 w-px bg-gray-300" />

              <div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-gray-400" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {lead.nomeFantasia || lead.razaoSocial || 'Sem nome'}
                    </h1>
                    <p className="text-sm text-gray-500">
                      CNPJ: {lead.cnpj}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={stageColors[lead.stage]}>
                {stageLabels[lead.stage]}
              </Badge>

              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>

              <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline">
              <PhoneCall className="h-4 w-4 mr-2" />
              Ligar
            </Button>
            <Button size="sm" variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button size="sm" variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar
            </Button>
            <Button size="sm" variant="outline">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Criar Tarefa
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Main Info */}
          <div className="col-span-8 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Score</p>
                      <p className="text-2xl font-bold">{lead.score}</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Probabilidade</p>
                      <p className="text-2xl font-bold">{lead.probability || 0}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Atividades</p>
                      <p className="text-2xl font-bold">{allActivities.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Tarefas</p>
                      <p className="text-2xl font-bold">{lead.tasks.length}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList>
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="activity">
                  Atividades ({allActivities.length})
                </TabsTrigger>
                <TabsTrigger value="tasks">
                  Tarefas ({lead.tasks.length})
                </TabsTrigger>
                <TabsTrigger value="opportunities">
                  Oportunidades ({lead.opportunities.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                {/* Company Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações da Empresa</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Razão Social</p>
                      <p className="font-medium">{lead.razaoSocial || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nome Fantasia</p>
                      <p className="font-medium">{lead.nomeFantasia || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">CNPJ</p>
                      <p className="font-medium">{lead.cnpj}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Situação Cadastral</p>
                      <Badge variant={lead.situacaoCadastral === 'ATIVA' ? 'default' : 'secondary'}>
                        {lead.situacaoCadastral}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">CNAE Principal</p>
                      <p className="font-medium text-sm">{lead.cnaePrincipal || '-'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Endereço
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      {lead.logradouro && `${lead.logradouro}, ${lead.numero || 's/n'}`}
                      {lead.bairro && ` - ${lead.bairro}`}
                    </p>
                    <p className="text-sm">
                      {lead.municipio && `${lead.municipio}`}
                      {lead.uf && ` - ${lead.uf}`}
                      {lead.cep && ` - CEP: ${lead.cep}`}
                    </p>
                  </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações de Contato</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lead.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{lead.email}</span>
                      </div>
                    )}
                    {lead.telefone1 && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>({lead.ddd1}) {lead.telefone1}</span>
                      </div>
                    )}
                    {lead.contactName && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>
                          {lead.contactName}
                          {lead.contactRole && ` - ${lead.contactRole}`}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline de Atividades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {allActivities.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        Nenhuma atividade registrada
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {allActivities.map((activity, index) => (
                          <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                {activity.type === 'call' && <PhoneCall className="h-5 w-5 text-blue-600" />}
                                {activity.type === 'email' && <Mail className="h-5 w-5 text-blue-600" />}
                                {activity.type === 'whatsapp' && <MessageSquare className="h-5 w-5 text-blue-600" />}
                                {activity.type === 'note' && <User className="h-5 w-5 text-blue-600" />}
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{activity.type.toUpperCase()}</p>
                              <p className="text-sm text-gray-600">{activity.description || activity.subject || activity.content}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(activity.createdAt).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks">
                <Card>
                  <CardHeader>
                    <CardTitle>Tarefas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lead.tasks.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        Nenhuma tarefa criada
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {lead.tasks.map((task) => (
                          <div key={task.id} className="p-3 border rounded-lg">
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-gray-600">{task.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="opportunities">
                <Card>
                  <CardHeader>
                    <CardTitle>Oportunidades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lead.opportunities.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        Nenhuma oportunidade criada
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {lead.opportunities.map((opp) => (
                          <div key={opp.id} className="p-3 border rounded-lg">
                            <p className="font-medium">{opp.name}</p>
                            <p className="text-sm text-gray-600">{opp.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Assigned To */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Responsável</CardTitle>
              </CardHeader>
              <CardContent>
                {lead.assignedTo ? (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {lead.assignedTo.fullName?.charAt(0) || lead.assignedTo.email.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{lead.assignedTo.fullName || lead.assignedTo.email}</p>
                      <p className="text-xs text-gray-500">{lead.assignedTo.role}</p>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Atribuir Responsável
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Detalhes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Fonte</p>
                  <p className="font-medium">{lead.source}</p>
                </div>
                <div>
                  <p className="text-gray-500">Qualificado</p>
                  <Badge variant={lead.isQualified ? 'default' : 'secondary'}>
                    {lead.isQualified ? 'Sim' : 'Não'}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-500">Criado em</p>
                  <p className="font-medium">
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Última atualização</p>
                  <p className="font-medium">
                    {new Date(lead.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {lead.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {lead.tags.map((tagRelation) => (
                      <Badge key={tagRelation.tag.id} variant="outline">
                        {tagRelation.tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
