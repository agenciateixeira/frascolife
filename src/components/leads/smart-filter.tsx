'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Mail, Phone, Building2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchResult {
  type: 'email' | 'phone' | 'company';
  value: string;
  cnpj?: string;
}

interface SmartFilterProps {
  onSelect: (type: string, value: string) => void;
}

export function SmartFilter({ onSelect }: SmartFilterProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.length >= 2) {
        searchLeads();
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  async function searchLeads() {
    setLoading(true);
    try {
      const response = await fetch(`/api/leads/search?q=${encodeURIComponent(query)}&type=all`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        setIsOpen(data.data.length > 0);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(result: SearchResult) {
    if (result.type === 'email') {
      onSelect('email', result.value);
    } else if (result.type === 'phone') {
      onSelect('phone', result.value);
    } else if (result.type === 'company') {
      onSelect('razaoSocial', result.value);
    }
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }

  function getIcon(type: string) {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-green-500" />;
      case 'company':
        return <Building2 className="w-4 h-4 text-purple-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  }

  function getLabel(type: string) {
    switch (type) {
      case 'email':
        return 'Email';
      case 'phone':
        return 'Telefone';
      case 'company':
        return 'Empresa';
      default:
        return '';
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar por empresa, email, telefone, CNPJ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className="pl-10 pr-10 h-12 text-base border-gray-300 focus:border-[#25d366] focus:ring-[#25d366]"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown de Resultados */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Buscando...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Nenhum resultado encontrado
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(result)}
                  className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 group"
                >
                  <div className="flex-shrink-0">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-[#25d366]">
                      {result.value}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getLabel(result.type)}
                      {result.cnpj && ` • CNPJ: ${result.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
