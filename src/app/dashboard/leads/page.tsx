'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LeadDetailModal } from '@/components/leads/lead-detail-modal';
import { AssignLeadModal } from '@/components/leads/assign-lead-modal';
import { AdvancedFilter } from '@/components/leads/advanced-filter';
import { Search, Filter, Download, X, ChevronLeft, ChevronRight, Mail, Phone, UserPlus } from 'lucide-react';

interface Lead {
  id: string;
  cnpj: string;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  situacaoCadastral: string;
  matrizFilial: string;
  cnaePrincipal: string | null;
  uf: string | null;
  municipio: string | null;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  cep: string | null;
  telefone1: string | null;
  ddd1: string | null;
  email: string | null;
}

export default function LeadsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Array<{key: string, value: string, label: string}>>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    uf: '',
    municipio: '',
    cnaePrincipal: '',
    situacaoCadastral: '',
    matrizFilial: '',
    email: '',
    phone: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user, page]);

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

  async function fetchLeads() {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });

      const response = await fetch(`/api/leads?${params}`);
      const data = await response.json();

      if (data.success) {
        setLeads(data.data);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(key: string, value: string) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  function applyFilters() {
    setPage(1);
    fetchLeads();
  }

  function clearFilters() {
    setFilters({
      cnpj: '',
      razaoSocial: '',
      nomeFantasia: '',
      uf: '',
      municipio: '',
      cnaePrincipal: '',
      situacaoCadastral: '',
      matrizFilial: '',
      email: '',
      phone: ''
    });
    setActiveFilters([]);
    setPage(1);
    setTimeout(fetchLeads, 100);
  }

  function formatCNPJ(cnpj: string) {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  function handleLeadClick(lead: Lead) {
    setSelectedLead(lead);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setSelectedLead(null);
  }

  function handleSelectLead(leadId: string) {
    setSelectedLeadIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  }

  function handleSelectAll() {
    if (selectedLeadIds.size === leads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(leads.map(l => l.id)));
    }
  }

  function handleOpenAssignModal() {
    if (selectedLeadIds.size === 0) {
      alert('Selecione pelo menos um lead');
      return;
    }
    setIsAssignModalOpen(true);
  }

  function handleCloseAssignModal() {
    setIsAssignModalOpen(false);
  }

  function handleLeadsAssigned() {
    setSelectedLeadIds(new Set());
    fetchLeads();
  }

  function handleApplyFilters(newFilters: Record<string, string>) {
    // Atualiza os filtros
    setFilters(prev => ({ ...prev, ...newFilters }));

    // Cria lista de filtros ativos
    const activeList = Object.entries(newFilters).map(([key, value]) => {
      const labels: Record<string, string> = {
        email: 'Email',
        phone: 'Telefone',
        cnpj: 'CNPJ',
        cnaePrincipal: 'CNAE',
        razaoSocial: 'Razão Social',
        nomeFantasia: 'Nome Fantasia',
        uf: 'UF',
        municipio: 'Município',
        situacaoCadastral: 'Situação',
        matrizFilial: 'Tipo'
      };
      return { key, value, label: labels[key] || key };
    });

    setActiveFilters(activeList);
    setPage(1);
    setTimeout(fetchLeads, 100);
  }

  function removeActiveFilter(key: string) {
    setFilters(prev => ({ ...prev, [key]: '' }));
    setActiveFilters(prev => prev.filter(f => f.key !== key));
    setPage(1);
    setTimeout(fetchLeads, 100);
  }

  function getFilterIcon(key: string) {
    switch(key) {
      case 'email':
        return <Mail className="w-3 h-3" />;
      case 'phone':
        return <Phone className="w-3 h-3" />;
      default:
        return <Filter className="w-3 h-3" />;
    }
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#25d366]"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
              <p className="text-sm text-gray-600 mt-1">
                {total.toLocaleString('pt-BR')} leads cadastrados
              </p>
            </div>

            <div className="flex gap-3">
              {selectedLeadIds.size > 0 && (
                <Button
                  onClick={handleOpenAssignModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Atribuir ({selectedLeadIds.size})
                </Button>
              )}

              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="border-gray-300"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros Avançados {showFilters && '✓'}
              </Button>

              <Button className="bg-[#25d366] hover:bg-[#20bd5a] text-white">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <div
                  key={filter.key}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#25d366]/10 text-[#25d366] rounded-full text-sm font-medium border border-[#25d366]/20"
                >
                  {getFilterIcon(filter.key)}
                  <span>{filter.label}: {filter.value}</span>
                  <button
                    onClick={() => removeActiveFilter(filter.key)}
                    className="hover:bg-[#25d366]/20 rounded-full p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  setActiveFilters([]);
                  clearFilters();
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Limpar todos
              </button>
            </div>
          )}
        </div>

        {/* Filtros Avançados */}
        {showFilters && (
          <div>
            <AdvancedFilter
              onApply={handleApplyFilters}
              onClear={clearFilters}
            />
          </div>
        )}

        {/* Tabela de Leads */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#25d366]"></div>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum lead encontrado</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 w-12">
                        <input
                          type="checkbox"
                          checked={selectedLeadIds.size === leads.length && leads.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CNPJ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Razão Social
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome Fantasia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        UF
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Município
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Situação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedLeadIds.has(lead.id)}
                            onChange={() => handleSelectLead(lead.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer" onClick={() => handleLeadClick(lead)}>
                          {formatCNPJ(lead.cnpj)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lead.razaoSocial || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.nomeFantasia || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.uf || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.municipio || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            lead.situacaoCadastral === 'ATIVA'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {lead.situacaoCadastral}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.matrizFilial}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="outline"
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    variant="outline"
                  >
                    Próxima
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{(page - 1) * 50 + 1}</span> até{' '}
                      <span className="font-medium">{Math.min(page * 50, total)}</span> de{' '}
                      <span className="font-medium">{total.toLocaleString('pt-BR')}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        Página {page} de {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal de Detalhes do Lead */}
        <LeadDetailModal
          lead={selectedLead}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onDataUpdated={fetchLeads}
        />

        {/* Modal de Atribuição de Leads */}
        <AssignLeadModal
          isOpen={isAssignModalOpen}
          onClose={handleCloseAssignModal}
          leadIds={Array.from(selectedLeadIds)}
          onAssigned={handleLeadsAssigned}
        />
      </div>
    </DashboardLayout>
  );
}
