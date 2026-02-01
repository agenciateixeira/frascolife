'use client';

import { useState } from 'react';
import { X, RefreshCw, Edit2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onDataUpdated?: () => void;
}

export function LeadDetailModal({ lead, isOpen, onClose, onDataUpdated }: LeadDetailModalProps) {
  const [enriching, setEnriching] = useState(false);
  const [enrichmentStatus, setEnrichmentStatus] = useState<string | null>(null);
  const [currentLead, setCurrentLead] = useState<Lead | null>(lead);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});

  // Atualiza lead local quando prop mudar
  if (lead && (!currentLead || currentLead.id !== lead.id)) {
    setCurrentLead(lead);
    setIsEditing(false);
    setEditedData({});
  }

  if (!isOpen || !currentLead) return null;

  async function handleEnrichData() {
    if (!currentLead) {
      console.error('[MODAL] Lead is null');
      return;
    }

    console.log('[MODAL] Starting enrichment for:', currentLead.cnpj);
    setEnriching(true);
    setEnrichmentStatus(null);

    try {
      const payload = {
        cnpj: currentLead.cnpj,
        companyId: currentLead.id
      };

      console.log('[MODAL] Sending request:', payload);

      const response = await fetch('/api/cnpj/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('[MODAL] Response status:', response.status);

      const data = await response.json();
      console.log('[MODAL] Response data:', data);

      if (response.ok) {
        console.log('[MODAL] Success!');
        setEnrichmentStatus('Dados atualizados com sucesso!');

        // Atualiza os dados do lead localmente imediatamente
        if (data.data) {
          setCurrentLead({
            ...currentLead,
            ...data.data
          });
        }

        if (onDataUpdated) {
          onDataUpdated();
        }

        // Não fecha mais o modal - dados atualizados aparecem imediatamente
        setTimeout(() => {
          setEnrichmentStatus(null);
        }, 3000);
      } else {
        console.error('[MODAL] Error:', data.error);
        setEnrichmentStatus(data.error || 'Erro ao enriquecer dados');
      }
    } catch (error: any) {
      console.error('[MODAL] Exception:', error);
      setEnrichmentStatus(`Erro: ${error.message}`);
    } finally {
      setEnriching(false);
    }
  }

  function formatCNPJ(cnpj: string) {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  function formatCEP(cep: string | null) {
    if (!cep) return '-';
    return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  }

  function formatPhone(ddd: string | null, phone: string | null) {
    if (!ddd || !phone) return '-';
    return `(${ddd}) ${phone}`;
  }

  function handleEditToggle() {
    if (isEditing) {
      // Cancelar edição
      setEditedData({});
    }
    setIsEditing(!isEditing);
  }

  async function handleSaveEdit() {
    if (!currentLead) return;

    try {
      setEnrichmentStatus('Salvando...');

      const response = await fetch('/api/leads/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentLead.id,
          ...editedData
        })
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentLead({ ...currentLead, ...editedData });
        setIsEditing(false);
        setEditedData({});
        setEnrichmentStatus('Dados salvos com sucesso!');

        if (onDataUpdated) {
          onDataUpdated();
        }

        setTimeout(() => {
          setEnrichmentStatus(null);
        }, 3000);
      } else {
        setEnrichmentStatus('Erro ao salvar dados');
      }
    } catch (error: any) {
      setEnrichmentStatus(`Erro: ${error.message}`);
    }
  }

  function handleFieldChange(field: string, value: string) {
    setEditedData({ ...editedData, [field]: value });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentLead.razaoSocial || 'Empresa'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                CNPJ: {formatCNPJ(currentLead.cnpj)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Status Message */}
          {enrichmentStatus && (
            <div className={`mx-6 mt-4 p-3 rounded-lg text-sm ${
              enrichmentStatus.includes('sucesso')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {enrichmentStatus}
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Informações Básicas */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Razão Social
                  </label>
                  <p className="text-sm text-gray-900">{currentLead.razaoSocial || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Nome Fantasia
                  </label>
                  <p className="text-sm text-gray-900">{currentLead.nomeFantasia || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    CNPJ
                  </label>
                  <p className="text-sm text-gray-900 font-mono">{formatCNPJ(currentLead.cnpj)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Situação Cadastral
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    currentLead.situacaoCadastral === 'ATIVA'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentLead.situacaoCadastral}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Tipo
                  </label>
                  <p className="text-sm text-gray-900">{currentLead.matrizFilial}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    CNAE Principal
                  </label>
                  <p className="text-sm text-gray-900">{currentLead.cnaePrincipal || '-'}</p>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Endereço
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Logradouro
                  </label>
                  <p className="text-sm text-gray-900">{currentLead.logradouro || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Número
                  </label>
                  <p className="text-sm text-gray-900">{currentLead.numero || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Bairro
                  </label>
                  <p className="text-sm text-gray-900">{currentLead.bairro || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    CEP
                  </label>
                  <p className="text-sm text-gray-900 font-mono">{formatCEP(currentLead.cep)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Município
                  </label>
                  <p className="text-sm text-gray-900">{currentLead.municipio || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    UF
                  </label>
                  <p className="text-sm text-gray-900">{currentLead.uf || '-'}</p>
                </div>
              </div>
            </div>

            {/* Contato */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Contato
                </h3>
                {!isEditing && (
                  <button
                    onClick={handleEditToggle}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Editar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    DDD
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      placeholder="11"
                      maxLength={2}
                      defaultValue={currentLead.ddd1 || ''}
                      onChange={(e) => handleFieldChange('ddd1', e.target.value)}
                      className="text-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{currentLead.ddd1 || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Telefone Principal
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      placeholder="987654321"
                      maxLength={9}
                      defaultValue={currentLead.telefone1 || ''}
                      onChange={(e) => handleFieldChange('telefone1', e.target.value)}
                      className="text-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{currentLead.telefone1 || '-'}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      placeholder="contato@empresa.com.br"
                      defaultValue={currentLead.email || ''}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className="text-sm"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 break-all">{currentLead.email || '-'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            {!isEditing ? (
              <>
                <Button
                  onClick={handleEnrichData}
                  disabled={enriching}
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  {enriching ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Enriquecendo...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Enriquecer Dados
                    </>
                  )}
                </Button>

                <div className="flex gap-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="border-gray-300"
                  >
                    Fechar
                  </Button>
                  <Button className="bg-[#25d366] hover:bg-[#20bd5a] text-white">
                    Iniciar Contato
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm text-gray-600">
                  Editando informações de contato
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleEditToggle}
                    variant="outline"
                    className="border-gray-300"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
