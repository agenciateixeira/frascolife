'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download, X, ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Filtros
  const [filters, setFilters] = useState({
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    uf: '',
    municipio: '',
    cnaePrincipal: '',
    situacaoCadastral: '',
    matrizFilial: ''
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
      matrizFilial: ''
    });
    setPage(1);
    setTimeout(fetchLeads, 100);
  }

  function formatCNPJ(cnpj: string) {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
            <p className="text-sm text-gray-600 mt-1">
              {total.toLocaleString('pt-BR')} leads cadastrados
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-gray-300"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros {showFilters && '✓'}
            </Button>

            <Button className="bg-[#25d366] hover:bg-[#20bd5a] text-white">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filtros Avançados */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filtros Avançados</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CNPJ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ
                </label>
                <Input
                  placeholder="00.000.000/0000-00"
                  value={filters.cnpj}
                  onChange={(e) => handleFilterChange('cnpj', e.target.value)}
                />
              </div>

              {/* Razão Social */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razão Social
                </label>
                <Input
                  placeholder="Digite a razão social"
                  value={filters.razaoSocial}
                  onChange={(e) => handleFilterChange('razaoSocial', e.target.value)}
                />
              </div>

              {/* Nome Fantasia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Fantasia
                </label>
                <Input
                  placeholder="Digite o nome fantasia"
                  value={filters.nomeFantasia}
                  onChange={(e) => handleFilterChange('nomeFantasia', e.target.value)}
                />
              </div>

              {/* UF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado (UF)
                </label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                  value={filters.uf}
                  onChange={(e) => handleFilterChange('uf', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="BA">Bahia</option>
                  <option value="PR">Paraná</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="SC">Santa Catarina</option>
                  {/* Adicionar outros estados */}
                </select>
              </div>

              {/* Município */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Município
                </label>
                <Input
                  placeholder="Digite o município"
                  value={filters.municipio}
                  onChange={(e) => handleFilterChange('municipio', e.target.value)}
                />
              </div>

              {/* CNAE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNAE Principal
                </label>
                <Input
                  placeholder="Digite o código CNAE"
                  value={filters.cnaePrincipal}
                  onChange={(e) => handleFilterChange('cnaePrincipal', e.target.value)}
                />
              </div>

              {/* Situação Cadastral */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Situação
                </label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                  value={filters.situacaoCadastral}
                  onChange={(e) => handleFilterChange('situacaoCadastral', e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="ATIVA">Ativa</option>
                  <option value="BAIXADA">Baixada</option>
                  <option value="SUSPENSA">Suspensa</option>
                </select>
              </div>

              {/* Matriz/Filial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
                  value={filters.matrizFilial}
                  onChange={(e) => handleFilterChange('matrizFilial', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="MATRIZ">Matriz</option>
                  <option value="FILIAL">Filial</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={applyFilters}
                className="bg-[#25d366] hover:bg-[#20bd5a] text-white"
              >
                Aplicar Filtros
              </Button>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-gray-300"
              >
                Limpar Filtros
              </Button>
            </div>
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
                      <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
      </div>
    </DashboardLayout>
  );
}
