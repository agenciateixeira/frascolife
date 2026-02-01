'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'select';
  options?: { value: string; label: string }[];
}

interface AdvancedFilterProps {
  onApply: (filters: Record<string, string>) => void;
  onClear: () => void;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'email', label: 'Email', placeholder: 'email@exemplo.com', type: 'text' },
  { id: 'phone', label: 'Telefone', placeholder: '(11) 98888-8888', type: 'text' },
  { id: 'cnpj', label: 'CNPJ', placeholder: '00.000.000/0000-00', type: 'text' },
  { id: 'cnaePrincipal', label: 'CNAE', placeholder: 'Código CNAE', type: 'text' },
  { id: 'razaoSocial', label: 'Razão Social', placeholder: 'Nome da empresa', type: 'text' },
  { id: 'nomeFantasia', label: 'Nome Fantasia', placeholder: 'Nome fantasia', type: 'text' },
  {
    id: 'uf',
    label: 'Estado (UF)',
    placeholder: 'Selecione',
    type: 'select',
    options: [
      { value: '', label: 'Todos' },
      { value: 'SP', label: 'São Paulo' },
      { value: 'RJ', label: 'Rio de Janeiro' },
      { value: 'MG', label: 'Minas Gerais' },
      { value: 'BA', label: 'Bahia' },
      { value: 'PR', label: 'Paraná' },
      { value: 'RS', label: 'Rio Grande do Sul' },
      { value: 'SC', label: 'Santa Catarina' },
      { value: 'GO', label: 'Goiás' },
      { value: 'PE', label: 'Pernambuco' },
      { value: 'CE', label: 'Ceará' },
    ]
  },
  { id: 'municipio', label: 'Município', placeholder: 'Cidade', type: 'text' },
  {
    id: 'situacaoCadastral',
    label: 'Situação',
    placeholder: 'Selecione',
    type: 'select',
    options: [
      { value: '', label: 'Todas' },
      { value: 'ATIVA', label: 'Ativa' },
      { value: 'BAIXADA', label: 'Baixada' },
      { value: 'SUSPENSA', label: 'Suspensa' },
    ]
  },
  {
    id: 'matrizFilial',
    label: 'Tipo',
    placeholder: 'Selecione',
    type: 'select',
    options: [
      { value: '', label: 'Todos' },
      { value: 'MATRIZ', label: 'Matriz' },
      { value: 'FILIAL', label: 'Filial' },
    ]
  },
];

export function AdvancedFilter({ onApply, onClear }: AdvancedFilterProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  function toggleFilter(filterId: string) {
    setSelectedFilters(prev => {
      if (prev.includes(filterId)) {
        // Remove o filtro
        const newValues = { ...filterValues };
        delete newValues[filterId];
        setFilterValues(newValues);
        return prev.filter(id => id !== filterId);
      } else {
        // Adiciona o filtro
        return [...prev, filterId];
      }
    });
  }

  function handleValueChange(filterId: string, value: string) {
    setFilterValues(prev => ({ ...prev, [filterId]: value }));
  }

  function handleApply() {
    const activeFilters: Record<string, string> = {};
    selectedFilters.forEach(id => {
      if (filterValues[id]) {
        activeFilters[id] = filterValues[id];
      }
    });
    onApply(activeFilters);
  }

  function handleClearAll() {
    setSelectedFilters([]);
    setFilterValues({});
    onClear();
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Filtros Avançados</h3>
          <p className="text-sm text-gray-500 mt-1">
            Selecione os campos que deseja filtrar
          </p>
        </div>
      </div>

      {/* Seleção de Filtros com Checkboxes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Campos para Filtrar
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {FILTER_OPTIONS.map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedFilters.includes(option.id)
                  ? 'border-[#25d366] bg-[#25d366]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedFilters.includes(option.id)}
                onChange={() => toggleFilter(option.id)}
                className="w-4 h-4 text-[#25d366] border-gray-300 rounded focus:ring-[#25d366]"
              />
              <span className="text-sm font-medium text-gray-700">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Campos de Input para Filtros Selecionados */}
      {selectedFilters.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Valores dos Filtros
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedFilters.map((filterId) => {
              const option = FILTER_OPTIONS.find(opt => opt.id === filterId);
              if (!option) return null;

              return (
                <div key={filterId}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {option.label}
                  </label>
                  {option.type === 'select' ? (
                    <select
                      value={filterValues[filterId] || ''}
                      onChange={(e) => handleValueChange(filterId, e.target.value)}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#25d366] focus:border-[#25d366]"
                    >
                      {option.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type="text"
                      placeholder={option.placeholder}
                      value={filterValues[filterId] || ''}
                      onChange={(e) => handleValueChange(filterId, e.target.value)}
                      className="focus:ring-2 focus:ring-[#25d366] focus:border-[#25d366]"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleApply}
          disabled={selectedFilters.length === 0}
          className="bg-[#25d366] hover:bg-[#20bd5a] text-white"
        >
          <Search className="w-4 h-4 mr-2" />
          Aplicar Filtros
        </Button>
        <Button
          onClick={handleClearAll}
          variant="outline"
          className="border-gray-300"
        >
          <X className="w-4 h-4 mr-2" />
          Limpar Tudo
        </Button>
      </div>
    </div>
  );
}
